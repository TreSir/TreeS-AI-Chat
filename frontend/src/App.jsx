import { useState, useCallback, useEffect, useRef } from 'react'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'
import Sidebar from './components/Sidebar'
import SettingsModal from './components/SettingsModal'
import MascotSettings from './components/MascotSettings'
import Mascot from './components/Mascot'
import { createChatSender } from './api'
import { loadSessions, saveSessions, loadActiveId, saveActiveId, loadTheme, saveTheme } from './utils/storage'

const sender = createChatSender()

const DEFAULT_MASCOT = { visible: true, color: 'violet', shape: 'blob', size: 'md' }

function loadMascot() {
  try {
    const raw = localStorage.getItem('ai-chat-mascot')
    return raw ? { ...DEFAULT_MASCOT, ...JSON.parse(raw) } : DEFAULT_MASCOT
  } catch { return DEFAULT_MASCOT }
}
function saveMascot(s) { localStorage.setItem('ai-chat-mascot', JSON.stringify(s)) }

function createSession() {
  return {
    id: Date.now().toString(),
    title: '新对话',
    messages: [],
    systemPrompt: '',
    createdAt: Date.now(),
  }
}

function App() {
  const [sessions, setSessions] = useState(() => loadSessions())
  const [activeId, setActiveId] = useState(() => loadActiveId())
  const [streaming, setStreaming] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMascotSettings, setShowMascotSettings] = useState(false)
  const [theme, setTheme] = useState(() => loadTheme())
  const [mascot, setMascot] = useState(() => loadMascot())
  const sidebarOpenRef = useRef(true)

  useEffect(() => {
    saveSessions(sessions)
  }, [sessions])

  useEffect(() => {
    saveActiveId(activeId)
  }, [activeId])

  useEffect(() => {
    saveTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    saveMascot(mascot)
  }, [mascot])

  const activeSession = sessions.find((s) => s.id === activeId) || null

  const ensureSession = useCallback(() => {
    if (sessions.length > 0 && activeSession) return activeSession
    const s = createSession()
    setSessions((prev) => [s, ...prev])
    setActiveId(s.id)
    return s
  }, [sessions, activeSession])

  const updateSession = useCallback((id, updater) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? updater(s) : s))
    )
  }, [])

  const handleSend = useCallback(async (text, baseMessages) => {
    const session = ensureSession()
    const prevMessages = baseMessages ?? session.messages
    const userMsg = { role: 'user', content: text }
    const newMessages = [...prevMessages, userMsg]

    updateSession(session.id, (s) => ({
      ...s,
      messages: newMessages,
      title: s.title === '新对话' ? text.slice(0, 30) : s.title,
    }))

    const aiMsg = { role: 'assistant', content: '' }
    updateSession(session.id, (s) => ({
      ...s,
      messages: [...newMessages, aiMsg],
    }))

    setStreaming(true)

    await sender.send(
      newMessages,
      session.systemPrompt,
      {
        onToken: (token) => {
          updateSession(session.id, (s) => {
            const msgs = [...s.messages]
            const last = msgs[msgs.length - 1]
            msgs[msgs.length - 1] = { ...last, content: last.content + token }
            return { ...s, messages: msgs }
          })
        },
        onDone: () => setStreaming(false),
      }
    )
  }, [ensureSession, updateSession])

  const handleStop = useCallback(() => {
    sender.stop()
    setStreaming(false)
  }, [])

  const handleRegenerate = useCallback((msgIndex) => {
    if (!activeSession) return
    const msgs = activeSession.messages.slice(0, msgIndex)
    let lastUserIdx = -1
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') { lastUserIdx = i; break }
    }
    if (lastUserIdx < 0) return
    const text = msgs[lastUserIdx].content
    const trimmed = msgs.slice(0, lastUserIdx)
    updateSession(activeSession.id, (s) => ({ ...s, messages: trimmed }))
    handleSend(text, trimmed)
  }, [activeSession, updateSession, handleSend])

  const handleNewChat = () => {
    const s = createSession()
    setSessions((prev) => [s, ...prev])
    setActiveId(s.id)
  }

  const handleSelectSession = (id) => {
    setActiveId(id)
  }

  const handleDeleteSession = (id) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id)
      if (id === activeId) {
        const newActive = next[0]
        setActiveId(newActive ? newActive.id : '')
      }
      return next
    })
  }

  const handleSaveSystemPrompt = (prompt) => {
    if (activeSession) {
      updateSession(activeSession.id, (s) => ({ ...s, systemPrompt: prompt }))
    }
    setShowSettings(false)
  }

  const handleToggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="app-layout">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={handleSelectSession}
        onNew={handleNewChat}
        onDelete={handleDeleteSession}
        onToggleSettings={() => setShowSettings(true)}
        onToggleMascot={() => setShowMascotSettings(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main">
        <header className="app-header">
          <div className="header-left">
            <h1>AI Chat</h1>
            <span className="badge">DeepSeek</span>
            {activeSession?.systemPrompt && (
              <span className="badge persona-badge" title={activeSession.systemPrompt}>
                已设人设
              </span>
            )}
          </div>
          {activeSession && activeSession.messages.length > 0 && (
            <button
              className="btn-clear"
              onClick={() => updateSession(activeSession.id, (s) => ({ ...s, messages: [] }))}
            >
              清空对话
            </button>
          )}
        </header>

        <ChatWindow
          messages={activeSession?.messages || []}
          onSend={handleSend}
          onRegenerate={handleRegenerate}
          streaming={streaming}
        />

        <Mascot settings={mascot} />

        <ChatInput
          onSend={handleSend}
          disabled={streaming}
          streaming={streaming}
          onStop={handleStop}
        />
      </main>

      {showSettings && (
        <SettingsModal
          currentPrompt={activeSession?.systemPrompt || ''}
          onSave={handleSaveSystemPrompt}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showMascotSettings && (
        <MascotSettings
          settings={mascot}
          onChange={setMascot}
          onClose={() => setShowMascotSettings(false)}
        />
      )}
    </div>
  )
}

export default App
