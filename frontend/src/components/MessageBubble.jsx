import { useState, useRef, useEffect } from 'react'
import hljs from 'highlight.js'

function highlightCode(code, lang) {
  try {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true })
    }
  } catch {}
  return hljs.highlightAuto(code)
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false)
  const result = highlightCode(code, lang)
  const highlighted = result.value
  const displayLang = lang || result.language || 'text'

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">{displayLang}</span>
        <button
          className="code-copy-btn"
          onClick={() => {
            navigator.clipboard.writeText(code).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            })
          }}
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre><code className="hljs" dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
    </div>
  )
}

function processMarkdown(text) {
  let html = text.trim()
  // Headings (before line break conversion)
  html = html.replace(/^###\s*(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s*(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s*(.+)$/gm, '<h1>$1</h1>')
  // Inline formatting
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
  // Unordered lists (before \n → <br/>)
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, (match) => '<ul>' + match.replace(/\n/g, '') + '</ul>')
  // Line breaks
  html = html.replace(/\n/g, '<br/>')
  return html
}

function renderContent(text) {
  if (!text) return null

  const codeRegex = /```(\w*)\r?\n([\s\S]*?)\r?\n```/g
  const parts = []
  let last = 0
  let m

  while ((m = codeRegex.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: 'text', c: text.slice(last, m.index) })
    parts.push({ t: 'code', lang: m[1] || '', code: m[2].trimEnd() })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ t: 'text', c: text.slice(last) })

  return parts.map((p, i) => {
    if (p.t === 'code') return <CodeBlock key={`c-${i}`} code={p.code} lang={p.lang} />
    return p.c.split(/\n{2,}/).filter(Boolean).map((block, j) => {
      const html = processMarkdown(block)
      const Tag = /^<h[123]/.test(html) ? 'div' : 'p'
      return <Tag key={`t-${i}-${j}`} className="md-block" dangerouslySetInnerHTML={{ __html: html }} />
    })
  })
}

function MessageBubble({ role, content, isLast, onRegenerate, onEdit, streaming }) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const textareaRef = useRef(null)
  const isUser = role === 'user'

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      textareaRef.current.focus()
    }
  }, [editing])

  const handleStartEdit = () => {
    setEditText(content)
    setEditing(true)
  }

  const handleSaveEdit = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== content) {
      onEdit?.(trimmed)
    }
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className={`message-row ${isUser ? 'user' : 'ai'}`}>
      <div className="avatar">{isUser ? '👤' : '🤖'}</div>
      <div className="bubble-wrap">
        <div className="bubble">
          {editing ? (
            <div className="edit-area">
              <textarea
                ref={textareaRef}
                className="edit-textarea"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <div className="edit-actions">
                <span className="edit-hint">Enter 保存 · Esc 取消</span>
                <div className="edit-btns">
                  <button className="edit-btn cancel" onClick={handleCancelEdit}>取消</button>
                  <button className="edit-btn save" onClick={handleSaveEdit}>保存</button>
                </div>
              </div>
            </div>
          ) : content ? (
            isUser ? content : renderContent(content)
          ) : (
            <span className="typing-cursor" />
          )}
        </div>
        {!editing && (
          <div className={`bubble-actions ${isUser ? 'user-actions' : ''}`}>
            {isUser && content && !streaming && (
              <button className="bubble-btn" onClick={handleStartEdit} title="编辑">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            {!isUser && content && (
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
            )}
            {!isUser && isLast && !streaming && (
              <button className="bubble-btn" onClick={onRegenerate}>🔄</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
