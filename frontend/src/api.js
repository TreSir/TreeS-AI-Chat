const API_BASE = import.meta.env.VITE_API_URL || 'https://trees-ai-chat.onrender.com'

export function createChatSender() {
  let controller = null

  const send = async (messages, system, { onToken, onDone }) => {
    controller = new AbortController()

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, system }),
        signal: controller.signal,
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (!data || data === '[DONE]') continue
            onToken(data)
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      throw err
    } finally {
      controller = null
    }

    onDone()
  }

  const stop = () => {
    if (controller) {
      controller.abort()
      controller = null
    }
  }

  return { send, stop }
}
