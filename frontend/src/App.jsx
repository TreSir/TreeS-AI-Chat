import { useState, useCallback, useEffect } from 'react'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'
import Sidebar from './components/Sidebar'
import SettingsModal from './components/SettingsModal'
import MascotSettings from './components/MascotSettings'
import Mascot from './components/Mascot'
import PromptLibrary from './components/PromptLibrary'
import { createChatSender } from './api'
import { loadSessions, saveSessions, loadActiveId, saveActiveId, loadTheme, saveTheme, loadPrompts, savePrompts, loadMascot, saveMascot } from './utils/storage'
import { PRESETS } from './constants'

const sender = createChatSender()

function getPersonaName(prompt) {
  if (!prompt) return ''
  const preset = PRESETS.find((p) => p.prompt === prompt)
  if (preset) return preset.label
  return prompt.length > 12 ? prompt.slice(0, 12) + '…' : prompt
}

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [prompts, setPrompts] = useState(() => loadPrompts())
  const [showPromptLib, setShowPromptLib] = useState(false)
  const [webSearch, setWebSearch] = useState(false)

  useEffect(() => { saveSessions(sessions) }, [sessions])
  useEffect(() => { saveActiveId(activeId) }, [activeId])
  useEffect(() => {
    saveTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  useEffect(() => { saveMascot(mascot) }, [mascot])
  useEffect(() => { savePrompts(prompts) }, [prompts])

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
        webSearch,
      }
    )
  }, [ensureSession, updateSession, webSearch])

  const handleStop = useCallback(() => {
    sender.stop()
    setStreaming(false)
  }, [])

  const handleEditMessage = useCallback((msgIndex, newText) => {
    if (!activeSession) return
    const trimmed = activeSession.messages.slice(0, msgIndex)
    updateSession(activeSession.id, (s) => ({ ...s, messages: trimmed }))
    handleSend(newText, trimmed)
  }, [activeSession, updateSession, handleSend])

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

  const handleSelectSession = (id) => setActiveId(id)

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

  const handleSavePrompt = (prompt) => {
    setPrompts((prev) => {
      const idx = prev.findIndex((p) => p.id === prompt.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = prompt
        return next
      }
      return [prompt, ...prev]
    })
  }

  const handleDeletePrompt = (id) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="app-layout">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onSelect={handleSelectSession}
        onNew={handleNewChat}
        onDelete={handleDeleteSession}
        onToggleSettings={() => setShowSettings(true)}
        onToggleMascot={() => setShowMascotSettings(true)}
        onTogglePromptLib={() => setShowPromptLib(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main">
        <header className="app-header">
          <div className="header-left">
            <h1>{activeSession?.systemPrompt ? getPersonaName(activeSession.systemPrompt) : 'AI Chat'}</h1>
          </div>
          <div className="header-right">
            {activeSession?.systemPrompt && (
              <span
                className="badge persona-badge"
                title={activeSession.systemPrompt}
                onClick={() => setShowSettings(true)}
              >
                已设人设
              </span>
            )}
            <button
              className="btn-header-icon"
              onClick={() => setShowSettings(true)}
              title="人设配置"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            {activeSession && activeSession.messages.length > 0 && (
              <button
                className="btn-clear"
                onClick={() => updateSession(activeSession.id, (s) => ({ ...s, messages: [] }))}
              >
                清空
              </button>
            )}
          </div>
        </header>

        <ChatWindow
          messages={activeSession?.messages || []}
          onSend={handleSend}
          onRegenerate={handleRegenerate}
          onEdit={handleEditMessage}
          streaming={streaming}
        />

        <Mascot settings={mascot} />

        <ChatInput
          onSend={handleSend}
          disabled={streaming}
          streaming={streaming}
          onStop={handleStop}
          prompts={prompts}
          webSearch={webSearch}
          onToggleWebSearch={() => setWebSearch((w) => !w)}
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

      {showPromptLib && (
        <PromptLibrary
          prompts={prompts}
          onSave={handleSavePrompt}
          onDelete={handleDeletePrompt}
          onClose={() => setShowPromptLib(false)}
        />
      )}
    </div>
  )
}

export default App
