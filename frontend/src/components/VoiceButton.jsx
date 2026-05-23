import { useState, useRef, useEffect } from 'react'

function VoiceButton({ onResult }) {
  const [listening, setListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [volume, setVolume] = useState([3, 3, 3, 3, 3])
  const recognitionRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    if (listening) {
      let frame = 0
      const tick = () => {
        frame++
        setVolume([
          3 + Math.sin(frame * 0.4) * 9 + Math.random() * 8,
          3 + Math.sin(frame * 0.5 + 1) * 10 + Math.random() * 7,
          3 + Math.sin(frame * 0.35 + 2) * 11 + Math.random() * 9,
          3 + Math.sin(frame * 0.45 + 3) * 9 + Math.random() * 8,
          3 + Math.sin(frame * 0.3 + 4) * 10 + Math.random() * 10,
        ])
        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(animRef.current)
    } else {
      setInterimText('')
    }
  }, [listening])

  const startListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('你的浏览器不支持语音识别，请使用 Chrome。')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) {
          final += r[0].transcript
        } else {
          interim += r[0].transcript
        }
      }
      if (final) {
        onResult(final)
        setListening(false)
        setInterimText('')
      } else if (interim) {
        setInterimText(interim)
      }
    }

    recognition.onerror = () => {
      setListening(false)
      setInterimText('')
    }
    recognition.onend = () => {
      setListening(false)
      setInterimText('')
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopListen = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }
  }

  const barStyle = (i) => ({
    height: `${Math.min(volume[i], 22)}px`,
    animationDelay: listening ? '0s' : `${i * 0.08}s`,
  })

  return (
    <div className={`voice-wrap ${listening ? 'listening' : ''}`}>
      {listening && interimText && (
        <div className="voice-interim">{interimText}</div>
      )}
      <button
        type="button"
        className="voice-btn"
        onClick={listening ? stopListen : startListen}
        title={listening ? '点击停止' : '语音输入'}
      >
        <span className="voice-icon">
          {listening ? (
            <span className="voice-bars">
              {volume.map((v, i) => (
                <span key={i} className="voice-bar" style={barStyle(i)} />
              ))}
            </span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </span>
      </button>
      {listening && (
        <span className="voice-label">聆听中...</span>
      )}
    </div>
  )
}

export default VoiceButton
