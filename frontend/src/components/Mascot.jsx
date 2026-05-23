import { useEffect, useRef } from 'react'

function Mascot() {
  const eyesRef = useRef([])

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

  return (
    <div className="mascot">
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
  )
}

export default Mascot
