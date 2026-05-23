import { useState, useEffect, useRef, useCallback } from 'react'

const MESSAGES = [
  '你好呀！',
  '我在呢~',
  '有什么想问的吗？',
  '嘿嘿~',
  '戳我干嘛！',
  '❤',
  '✨',
  '今天天气真好~',
]

const COLOR_MAP = {
  violet: 'linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #4f46e5 100%)',
  pink: 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 40%, #ec4899 100%)',
  blue: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 40%, #0ea5e9 100%)',
  green: 'linear-gradient(135deg, #86efac 0%, #4ade80 40%, #22c55e 100%)',
  orange: 'linear-gradient(135deg, #fdba74 0%, #fb923c 40%, #f97316 100%)',
  dark: 'linear-gradient(135deg, #64748b 0%, #475569 40%, #334155 100%)',
}

const SHAPE_MAP = {
  blob: '50% 50% 50% 50% / 40% 40% 60% 60%',
  cat: '50% 50% 50% 50% / 55% 55% 45% 45%',
  round: '50%',
  soft: '45% 55% 55% 45% / 55% 50% 50% 45%',
}

const SIZE_MAP = { sm: 0.75, md: 1, lg: 1.35 }

function Mascot({ settings }) {
  const { color, shape, size, visible } = settings
  const baseSize = 56 * SIZE_MAP[size] || SIZE_MAP.md * 56
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [sparkles, setSparkles] = useState([])
  const [speech, setSpeech] = useState('')
  const eyesRef = useRef([])
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 })
  const speechTimer = useRef(null)
  const initRef = useRef(false)
  const isCat = shape === 'cat'
  const earColor = color === 'pink' ? '#f472b6' : color === 'blue' ? '#38bdf8' : color === 'green' ? '#4ade80' : color === 'orange' ? '#fb923c' : color === 'dark' ? '#475569' : '#818cf8'

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    setPos({
      x: window.innerWidth - 100,
      y: window.innerHeight - 200,
    })
  }, [])

  // Eye tracking
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

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
    setSpeech('')
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    }
  }, [pos])

  useEffect(() => {
    if (!dragging) return
    const handleMove = (e) => {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy })
    }
    const handleUp = () => setDragging(false)
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [dragging])

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
      className={`mascot-wrap ${dragging ? 'dragging' : ''} ${clicked ? 'bounced' : ''}`}
      style={{ left: pos.x, top: pos.y }}
    >
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle"
          style={{ '--angle': `${s.angle}deg`, '--color': s.color }}
        />
      ))}

      {speech && (
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
        {/* Cat ears */}
        {isCat && (
          <div className="cat-ears">
            <div className="cat-ear left" style={{ borderBottomColor: earColor }} />
            <div className="cat-ear right" style={{ borderBottomColor: earColor }} />
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
            <div className={`mascot-eye right ${isCat ? 'cat-eye' : ''}`} style={{ width: baseSize * 0.18, height: baseSize * 0.20 }}>
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
