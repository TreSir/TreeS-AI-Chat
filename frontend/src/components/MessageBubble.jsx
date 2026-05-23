import { useState } from 'react'

function renderContent(text) {
  if (!text) return null
  const parts = text.split(/(```\w*\n[\s\S]*?\n```)/g)

  return parts.map((part, i) => {
    const codeMatch = part.match(/^```(\w*)\n([\s\S]*?)\n```$/)
    if (codeMatch) return <code key={i}>{codeMatch[2]}</code>
    if (!part.trim()) return null
    const withBold = part.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    return withBold.split('\n\n').filter(Boolean).map((p, j) => (
      <p key={`${i}-${j}`} dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br/>') }} />
    ))
  })
}

function MessageBubble({ role, content, isLast, onRegenerate, streaming }) {
  const [copied, setCopied] = useState(false)
  const isUser = role === 'user'

  return (
    <div className={`message-row ${isUser ? 'user' : 'ai'}`}>
      <div className="avatar">{isUser ? '👤' : '🤖'}</div>
      <div className="bubble-wrap">
        <div className="bubble">
          {content
            ? isUser ? content : renderContent(content)
            : <span className="typing-cursor" />
          }
        </div>
        {!isUser && content && (
          <div className="bubble-actions">
            <button
              className={`bubble-btn ${copied ? 'copied' : ''}`}
              onClick={() => {
                navigator.clipboard.writeText(content).then(() => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                })
              }}
            >
              {copied ? '✓' : '📋'}
            </button>
            {isLast && !streaming && (
              <button className="bubble-btn" onClick={onRegenerate}>🔄</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
