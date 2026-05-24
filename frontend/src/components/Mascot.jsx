import { useState, useEffect, useRef, useCallback } from 'react'
import { COLORS, SHAPES, SIZES, MASCOT_MESSAGES, earColor, findByValue } from '../constants'

function Mascot({ settings }) {
  const { color, shape, size, visible, speechLang } = settings
  const s = findByValue(SHAPES, shape, 0)
  const c = findByValue(COLORS, color, 0)
  const sc = findByValue(SIZES, size, 1)
  const baseSize = 56 * sc.scale
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [sparkles, setSparkles] = useState([])
  const [speech, setSpeech] = useState('')
  const [reading, setReading] = useState(false)
  const [idle, setIdle] = useState(false)
  const eyesRef = useRef([])
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 })
  const speechTimer = useRef(null)
  const initRef = useRef(false)
  const readingElRef = useRef(null)
  const idleTimer = useRef(null)
  const isCat = shape === 'cat'

  const resetIdle = useCallback(() => {
    setIdle(false)
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setIdle(true), 5000)
  }, [])

  useEffect(() => {
    resetIdle()
    return () => clearTimeout(idleTimer.current)
  }, [resetIdle])

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

  const readingRef = useRef(false)
  const stopReading = useCallback(() => {
    window.speechSynthesis.cancel()
    setReading(false)
    readingRef.current = false
  }, [])

  const hasMoved = useRef(false)

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    resetIdle()
    setDragging(true)
    setSpeech('')
    hasMoved.current = false
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
  }, [pos, resetIdle])

  useEffect(() => {
    if (!dragging) return

    const handleMove = (e) => {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy })

      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return

      if (!hasMoved.current) {
        hasMoved.current = true
        if (readingRef.current) {
          stopReading()
        }
      }

      const els = document.elementsFromPoint(e.clientX, e.clientY)
      const bubble = els.find((el) => el.classList.contains('bubble'))

      if (bubble && bubble !== readingElRef.current) {
        const text = bubble.textContent.trim()
        if (text) {
          window.speechSynthesis.cancel()
          readingElRef.current = bubble
          readingRef.current = true
          setReading(true)
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = speechLang || 'zh-CN'
          utterance.rate = 1
          utterance.onend = () => {
            readingElRef.current = null
            readingRef.current = false
            setReading(false)
          }
          utterance.onerror = () => {
            readingElRef.current = null
            readingRef.current = false
            setReading(false)
          }
          window.speechSynthesis.speak(utterance)
        }
      } else if (!bubble && readingRef.current) {
        stopReading()
      }
    }

    const handleUp = () => {
      setDragging(false)
      resetIdle()
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [dragging, speechLang, stopReading])

  const handleClick = useCallback(() => {
    if (hasMoved.current || reading) return
    resetIdle()
    setClicked(true)
    setTimeout(() => setClicked(false), 400)
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / 8) * 360,
      color: ['#818cf8', '#c084fc', '#f9a8d4', '#fde68a'][i % 4],
    }))
    setSparkles((prev) => [...prev, ...newSparkles])
    setTimeout(() => setSparkles((prev) => prev.filter((s) => !newSparkles.includes(s))), 600)
    const msg = MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)]
    setSpeech(msg)
    clearTimeout(speechTimer.current)
    speechTimer.current = setTimeout(() => setSpeech(''), 2200)
  }, [reading, resetIdle])

  if (!visible) return null

  return (
    <div
      className={`mascot-wrap ${dragging ? 'dragging' : ''} ${clicked ? 'bounced' : ''} ${reading ? 'reading' : ''} ${idle && !dragging && !reading ? 'idle' : ''}`}
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
            borderRadius: s.radius,
            background: c.css,
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
