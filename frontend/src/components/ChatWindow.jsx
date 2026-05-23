import { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'

const SUGGESTIONS = [
  '用 Python 写一个快速排序',
  '解释一下什么是 REST API',
  '推荐几本好看的科幻小说',
  '帮我写一段 React Hook 代码',
  '今天心情不太好，讲个笑话吧',
]

function ChatWindow({ messages, onSend, onRegenerate, streaming }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <div className="empty-icon-wrap">✨</div>
          <h2>你好，我是 AI 助手</h2>
          <p>基于 DeepSeek 大模型，你可以问我任何问题</p>
          <div className="suggestions">
            {SUGGESTIONS.map((text) => (
              <button
                key={text}
                className="suggestion-chip"
                onClick={() => onSend(text)}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window">
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          role={msg.role}
          content={msg.content}
          isLast={i === messages.length - 1}
          onRegenerate={() => onRegenerate(i)}
          streaming={streaming}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

export default ChatWindow
