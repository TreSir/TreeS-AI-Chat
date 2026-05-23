const COLORS = [
  { label: '紫罗兰', value: 'violet', css: 'linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #4f46e5 100%)' },
  { label: '蜜桃粉', value: 'pink', css: 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 40%, #ec4899 100%)' },
  { label: '天空蓝', value: 'blue', css: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 40%, #0ea5e9 100%)' },
  { label: '薄荷绿', value: 'green', css: 'linear-gradient(135deg, #86efac 0%, #4ade80 40%, #22c55e 100%)' },
  { label: '暖橘', value: 'orange', css: 'linear-gradient(135deg, #fdba74 0%, #fb923c 40%, #f97316 100%)' },
  { label: '暗夜黑', value: 'dark', css: 'linear-gradient(135deg, #64748b 0%, #475569 40%, #334155 100%)' },
]

const SHAPES = [
  { label: '团子', value: 'blob', radius: '50% 50% 50% 50% / 40% 40% 60% 60%' },
  { label: '猫猫', value: 'cat', radius: '50% 50% 50% 50% / 55% 55% 45% 45%' },
  { label: '圆圆', value: 'round', radius: '50%' },
  { label: '软糖', value: 'soft', radius: '45% 55% 55% 45% / 55% 50% 50% 45%' },
]

const SIZES = [
  { label: '小', value: 'sm', scale: 0.75 },
  { label: '中', value: 'md', scale: 1 },
  { label: '大', value: 'lg', scale: 1.35 },
]

function MascotSettings({ settings, onChange, onClose }) {
  const set = (key, value) => onChange({ ...settings, [key]: value })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal mascot-settings-modal" onClick={(e) => e.stopPropagation()}>
        <h3>精灵设置</h3>

        {/* Show/Hide */}
        <label className="setting-row">
          <span className="setting-label">显示精灵</span>
          <button
            className={`toggle-switch ${settings.visible ? 'on' : 'off'}`}
            onClick={() => set('visible', !settings.visible)}
          >
            <span className="toggle-knob" />
          </button>
        </label>

        {/* Color */}
        <div className="setting-section">
          <span className="setting-label">颜色</span>
          <div className="color-grid">
            {COLORS.map((c) => (
              <button
                key={c.value}
                className={`color-chip ${settings.color === c.value ? 'active' : ''}`}
                style={{ background: c.css }}
                onClick={() => set('color', c.value)}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Shape */}
        <div className="setting-section">
          <span className="setting-label">形状</span>
          <div className="shape-grid">
            {SHAPES.map((s) => (
              <button
                key={s.value}
                className={`shape-chip ${settings.shape === s.value ? 'active' : ''}`}
                onClick={() => set('shape', s.value)}
              >
                <span
                  className="shape-preview"
                  style={{
                    borderRadius: s.radius,
                    background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                  }}
                />
                <span className="shape-label">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="setting-section">
          <span className="setting-label">大小</span>
          <div className="size-row">
            {SIZES.map((s) => (
              <button
                key={s.value}
                className={`size-chip ${settings.size === s.value ? 'active' : ''}`}
                onClick={() => set('size', s.value)}
                style={{ transform: `scale(${s.scale})` }}
              >
                <span
                  className="size-dot"
                  style={{
                    background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}

export { COLORS, SHAPES, SIZES }
export default MascotSettings
