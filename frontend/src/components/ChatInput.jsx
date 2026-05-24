import { useState, useRef, useEffect } from 'react'
import VoiceButton from './VoiceButton'

function ChatInput({ onSend, disabled, streaming, onStop, prompts, webSearch, onToggleWebSearch }) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const match = input.match(/^\/(\S*)$/)
    if (match && prompts.length > 0) {
      const query = match[1].toLowerCase()
      const filtered = prompts
        .filter((p) => p.name.toLowerCase().includes(query))
        .slice(0, 6)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedIdx(0)
    } else {
      setShowSuggestions(false)
    }
  }, [input, prompts])

  const insertPrompt = (prompt) => {
    setInput(prompt.content)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (showSuggestions && suggestions.length > 0) {
      insertPrompt(suggestions[selectedIdx])
      return
    }
    const text = input.trim()
    if (!text || disabled) return
    setInput('')
    onSend(text)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="chat-input-wrap">
      {showSuggestions && (
        <div className="slash-dropdown">
          {suggestions.map((p, i) => (
            <button
              key={p.id}
              className={`slash-item ${i === selectedIdx ? 'selected' : ''}`}
              onClick={() => insertPrompt(p)}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <span className="slash-name">/{p.name}</span>
              <span className="slash-preview">{p.content.slice(0, 50)}{p.content.length > 50 ? '…' : ''}</span>
            </button>
          ))}
        </div>
      )}
      <form className="chat-input" onSubmit={handleSubmit}>
        <VoiceButton onResult={(text) => setInput((prev) => prev + text)} />
        <button
          type="button"
          className={`btn-web-search ${webSearch ? 'active' : ''}`}
          onClick={onToggleWebSearch}
          title={webSearch ? '已开启联网搜索' : '点击开启联网搜索'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'AI 正在回复...' : '输入消息，Enter 发送 · 输入 / 调用提示词库'}
          disabled={disabled}
          autoFocus
        />
        {streaming ? (
          <button type="button" className="btn-stop" onClick={onStop}>停止</button>
        ) : (
          <button type="submit" className="btn-send" disabled={disabled || (!input.trim() && !showSuggestions)}>
            发送
          </button>
        )}
      </form>
    </div>
  )
}

export default ChatInput
