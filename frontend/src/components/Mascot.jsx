import { useState, useEffect, useRef, useCallback } from 'react'

const MESSAGES = [
  '你好呀！', '我在呢~', '有什么想问的吗？', '嘿嘿~', '戳我干嘛！', '❤', '✨', '今天天气真好~',
]

const COLOR_MAP = {
  violet: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 30%, #6366f1 100%)',
  pink: 'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 30%, #f472b6 100%)',
  blue: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 30%, #38bdf8 100%)',
  green: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 30%, #4ade80 100%)',
  orange: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 30%, #fb923c 100%)',
  dark: 'linear-gradient(135deg, #94a3b8 0%, #64748b 30%, #475569 100%)',
  sunset: 'linear-gradient(135deg, #fbbf24 0%, #fb923c 40%, #f472b6 100%)',
  ocean: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #6366f1 100%)',
  aurora: 'linear-gradient(135deg, #34d399 0%, #818cf8 50%, #c084fc 100%)',
  rosegold: 'linear-gradient(135deg, #fda4af 0%, #fb7185 40%, #fbbf24 100%)',
  galaxy: 'linear-gradient(135deg, #6366f1 0%, #a855f7 40%, #ec4899 100%)',
  forest: 'linear-gradient(135deg, #86efac 0%, #22c55e 30%, #0d9488 100%)',
  rainbow: 'linear-gradient(135deg, #fca5a5 0%, #fde047 25%, #86efac 50%, #7dd3fc 75%, #c084fc 100%)',
}

const SHAPE_MAP = {
  blob: '50% 50% 50% 50% / 40% 40% 60% 60%',
  cat: '50% 50% 50% 50% / 55% 55% 45% 45%',
  round: '50%',
  egg: '45% 45% 55% 55% / 55% 55% 45% 45%',
  drop: '50% 0 50% 50% / 30% 0 70% 70%',
  soft: '40% 60% 55% 45% / 55% 45% 50% 50%',
  cloud: '55% 55% 30% 30% / 65% 65% 35% 35%',
  bean: '60% 40% 50% 50% / 40% 40% 60% 60%',
  square: '22%',
  pill: '99px',
}

const SIZE_MAP = { sm: 0.75, md: 1, lg: 1.35 }

function earColor(c) {
  if (c === 'pink') return '#f472b6'
  if (c === 'blue') return '#38bdf8'
  if (c === 'green') return '#4ade80'
  if (c === 'orange') return '#fb923c'
  if (c === 'dark') return '#64748b'
  return '#818cf8'
}

function Mascot({ settings }) {
  const { color, shape, size, visible, speechLang } = settings
  const baseSize = 56 * (SIZE_MAP[size] || 1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [sparkles, setSparkles] = useState([])
  const [speech, setSpeech] = useState('')
  const [reading, setReading] = useState(false)
  const eyesRef = useRef([])
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 })
  const speechTimer = useRef(null)
  const initRef = useRef(false)
  const readingElRef = useRef(null)
  const isCat = shape === 'cat'

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    setPos({ x: window.innerWidth - 100, y: window.innerHeight - 200 })
  }, [])

  useEffect(() => {
    const handleMouse = (e) => {
      eyesRef.current.forEach((el) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
        const dist = Math.min(3, Math.hypot(e.clientX - cx, e.clientY - cy) * 0.02)
        el.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`
      })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const stopReading = useCallback(() => {
    window.speechSynthesis.cancel()
    setReading(false)
    readingElRef.current = null
  }, [])

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
    setSpeech('')
    stopReading()
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
  }, [pos, stopReading])

  useEffect(() => {
    if (!dragging) return

    const handleMove = (e) => {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy })

      // Detect message bubbles under mascot center
      const els = document.elementsFromPoint(e.clientX, e.clientY)
      const bubble = els.find((el) => el.classList.contains('bubble'))

      if (bubble && bubble !== readingElRef.current) {
        const text = bubble.textContent.trim()
        if (text) {
          window.speechSynthesis.cancel()
          readingElRef.current = bubble
          setReading(true)
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = speechLang || 'zh-CN'
          utterance.rate = 1
          utterance.onend = () => {
            readingElRef.current = null
            setReading(false)
          }
          utterance.onerror = () => {
            readingElRef.current = null
            setReading(false)
          }
          window.speechSynthesis.speak(utterance)
        }
      } else if (!bubble && readingElRef.current) {
        stopReading()
      }
    }

    const handleUp = () => {
      setDragging(false)
      stopReading()
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [dragging, speechLang, stopReading])

  const handleClick = useCallback(() => {
    setClicked(true)
    setTimeout(() => setClicked(false), 400)
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / 8) * 360,
      color: ['#818cf8', '#c084fc', '#f9a8d4', '#fde68a'][i % 4],
    }))
    setSparkles((prev) => [...prev, ...newSparkles])
    setTimeout(() => setSparkles((prev) => prev.filter((s) => !newSparkles.includes(s))), 600)
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
    setSpeech(msg)
    clearTimeout(speechTimer.current)
    speechTimer.current = setTimeout(() => setSpeech(''), 2200)
  }, [])

  if (!visible) return null

  return (
    <div
      className={`mascot-wrap ${dragging ? 'dragging' : ''} ${clicked ? 'bounced' : ''} ${reading ? 'reading' : ''}`}
      style={{ left: pos.x, top: pos.y }}
    >
      {sparkles.map((s) => (
        <div key={s.id} className="sparkle" style={{ '--angle': `${s.angle}deg`, '--color': s.color }} />
      ))}

      {reading && (
        <div className="mascot-speech reading-speech">
          朗读中 🔊
          <div className="mascot-speech-tail" />
        </div>
      )}

      {speech && !reading && (
        <div className="mascot-speech">
          {speech}
          <div className="mascot-speech-tail" />
        </div>
      )}

      <div
        className={`mascot ${isCat ? 'shape-cat' : ''}`}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        {isCat && (
          <div className="cat-ears">
            <div className="cat-ear left" style={{ borderBottomColor: earColor(color) }} />
            <div className="cat-ear right" style={{ borderBottomColor: earColor(color) }} />
          </div>
        )}

        <div
          className="mascot-body"
          style={{
            width: baseSize,
            height: baseSize,
            borderRadius: SHAPE_MAP[shape] || SHAPE_MAP.blob,
            background: COLOR_MAP[color] || COLOR_MAP.violet,
          }}
        >
          <div className="mascot-face" style={{ top: baseSize * 0.32 }}>
            <div className="mascot-eye left" style={{ width: baseSize * 0.18, height: baseSize * 0.20 }}>
              <div className="mascot-pupil" style={{ width: baseSize * 0.09, height: baseSize * 0.11 }} ref={(el) => (eyesRef.current[0] = el)} />
            </div>
            <div className="mascot-eye right" style={{ width: baseSize * 0.18, height: baseSize * 0.20 }}>
              <div className="mascot-pupil" style={{ width: baseSize * 0.09, height: baseSize * 0.11 }} ref={(el) => (eyesRef.current[1] = el)} />
            </div>
          </div>
          <div className="mascot-mouth" style={{ bottom: baseSize * 0.25, width: baseSize * 0.18, height: baseSize * 0.09 }} />
          <div className="mascot-blush left" style={{ top: baseSize * 0.43, left: baseSize * 0.15, width: baseSize * 0.14, height: baseSize * 0.09 }} />
          <div className="mascot-blush right" style={{ top: baseSize * 0.43, right: baseSize * 0.15, width: baseSize * 0.14, height: baseSize * 0.09 }} />
        </div>
        <div className="mascot-shadow" style={{ width: baseSize * 0.7, height: baseSize * 0.14 }} />
      </div>
    </div>
  )
}

export default Mascot
