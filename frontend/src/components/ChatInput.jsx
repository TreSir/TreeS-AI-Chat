import { useState } from 'react'
import VoiceButton from './VoiceButton'

function ChatInput({ onSend, disabled, streaming, onStop }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || disabled) return
    setInput('')
    onSend(text)
  }

  return (
    <div className="chat-input-wrap">
      <form className="chat-input" onSubmit={handleSubmit}>
        <VoiceButton onResult={(text) => {
          setInput((prev) => prev + text)
        }} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? 'AI 正在回复...' : '输入消息，Enter 发送'}
          disabled={disabled}
          autoFocus
        />
        {streaming ? (
          <button type="button" className="btn-stop" onClick={onStop}>
            停止
          </button>
        ) : (
          <button
            type="submit"
            className="btn-send"
            disabled={disabled || !input.trim()}
          >
            发送
          </button>
        )}
      </form>
    </div>
  )
}

export default ChatInput
