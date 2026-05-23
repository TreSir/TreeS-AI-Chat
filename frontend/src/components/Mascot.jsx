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

function Mascot() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [sparkles, setSparkles] = useState([])
  const [speech, setSpeech] = useState('')
  const eyesRef = useRef([])
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 })
  const speechTimer = useRef(null)
  const initRef = useRef(false)

  // Init position at bottom-right of main area
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

  // Drag handlers
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
      setPos({
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      })
    }
    const handleUp = () => setDragging(false)
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [dragging])

  // Click interaction
  const handleClick = useCallback(() => {
    setClicked(true)
    setTimeout(() => setClicked(false), 400)

    // Sparkles
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / 8) * 360,
      color: ['#818cf8', '#c084fc', '#f9a8d4', '#fde68a'][i % 4],
    }))
    setSparkles((prev) => [...prev, ...newSparkles])
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !newSparkles.includes(s)))
    }, 600)

    // Speech bubble
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
    setSpeech(msg)
    clearTimeout(speechTimer.current)
    speechTimer.current = setTimeout(() => setSpeech(''), 2200)
  }, [])

  return (
    <div
      className={`mascot-wrap ${dragging ? 'dragging' : ''} ${clicked ? 'bounced' : ''}`}
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Sparkles */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            '--angle': `${s.angle}deg`,
            '--color': s.color,
          }}
        />
      ))}

      {/* Speech bubble */}
      {speech && (
        <div className="mascot-speech">
          {speech}
          <div className="mascot-speech-tail" />
        </div>
      )}

      {/* The mascot itself */}
      <div
        className="mascot"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <div className="mascot-body">
          <div className="mascot-face">
            <div className="mascot-eye left">
              <div className="mascot-pupil" ref={(el) => (eyesRef.current[0] = el)} />
            </div>
            <div className="mascot-eye right">
              <div className="mascot-pupil" ref={(el) => (eyesRef.current[1] = el)} />
            </div>
          </div>
          <div className="mascot-mouth" />
          <div className="mascot-blush left" />
          <div className="mascot-blush right" />
        </div>
        <div className="mascot-shadow" />
      </div>
    </div>
  )
}

export default Mascot
