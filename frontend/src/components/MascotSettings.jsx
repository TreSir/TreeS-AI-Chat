const COLORS = [
  { label: '紫罗兰', value: 'violet', css: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 30%, #6366f1 100%)' },
  { label: '蜜桃粉', value: 'pink', css: 'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 30%, #f472b6 100%)' },
  { label: '天空蓝', value: 'blue', css: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 30%, #38bdf8 100%)' },
  { label: '薄荷绿', value: 'green', css: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 30%, #4ade80 100%)' },
  { label: '暖橘', value: 'orange', css: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 30%, #fb923c 100%)' },
  { label: '暗夜', value: 'dark', css: 'linear-gradient(135deg, #94a3b8 0%, #64748b 30%, #475569 100%)' },
  { label: '日落', value: 'sunset', css: 'linear-gradient(135deg, #fbbf24 0%, #fb923c 40%, #f472b6 100%)' },
  { label: '海洋', value: 'ocean', css: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #6366f1 100%)' },
  { label: '极光', value: 'aurora', css: 'linear-gradient(135deg, #34d399 0%, #818cf8 50%, #c084fc 100%)' },
  { label: '玫瑰金', value: 'rosegold', css: 'linear-gradient(135deg, #fda4af 0%, #fb7185 40%, #fbbf24 100%)' },
  { label: '银河', value: 'galaxy', css: 'linear-gradient(135deg, #6366f1 0%, #a855f7 40%, #ec4899 100%)' },
  { label: '森林', value: 'forest', css: 'linear-gradient(135deg, #86efac 0%, #22c55e 30%, #0d9488 100%)' },
  { label: '彩虹', value: 'rainbow', css: 'linear-gradient(135deg, #fca5a5 0%, #fde047 25%, #86efac 50%, #7dd3fc 75%, #c084fc 100%)' },
]

const SHAPES = [
  { label: '团子', value: 'blob', radius: '50% 50% 50% 50% / 40% 40% 60% 60%' },
  { label: '猫猫', value: 'cat', radius: '50% 50% 50% 50% / 55% 55% 45% 45%' },
  { label: '圆圆', value: 'round', radius: '50%' },
  { label: '鸡蛋', value: 'egg', radius: '45% 45% 55% 55% / 55% 55% 45% 45%' },
  { label: '水滴', value: 'drop', radius: '50% 0 50% 50% / 30% 0 70% 70%' },
  { label: '软糖', value: 'soft', radius: '40% 60% 55% 45% / 55% 45% 50% 50%' },
  { label: '云朵', value: 'cloud', radius: '55% 55% 30% 30% / 65% 65% 35% 35%' },
  { label: '豆子', value: 'bean', radius: '60% 40% 50% 50% / 40% 40% 60% 60%' },
  { label: '方形', value: 'square', radius: '22%' },
  { label: '胶囊', value: 'pill', radius: '99px' },
]

const SIZES = [
  { label: '小', value: 'sm', scale: 0.75 },
  { label: '中', value: 'md', scale: 1 },
  { label: '大', value: 'lg', scale: 1.35 },
]

function PreviewMascot({ color, shape, size }) {
  const s = SHAPES.find((x) => x.value === shape) || SHAPES[0]
  const c = COLORS.find((x) => x.value === color) || COLORS[0]
  const sc = SIZES.find((x) => x.value === size) || SIZES[1]
  const base = 48 * sc.scale
  const isCat = shape === 'cat'

  return (
    <div className="preview-mascot">
      <div className="preview-float" style={{ transform: `scale(${sc.scale})` }}>
        {isCat && (
          <div className="preview-ears">
            <div className="preview-ear left" style={{ borderBottomColor: catEarColor(color) }} />
            <div className="preview-ear right" style={{ borderBottomColor: catEarColor(color) }} />
          </div>
        )}
        <div
          className="preview-body"
          style={{
            width: base,
            height: base,
            borderRadius: s.radius,
            background: c.css,
          }}
        >
          <div className="preview-face">
            <div className="preview-eye" />
            <div className="preview-eye" />
          </div>
          <div className="preview-mouth" />
        </div>
        <div className="preview-shadow" style={{ width: base * 0.65, height: base * 0.14 }} />
      </div>
    </div>
  )
}

function catEarColor(color) {
  if (color === 'pink') return '#f472b6'
  if (color === 'blue') return '#38bdf8'
  if (color === 'green') return '#4ade80'
  if (color === 'orange') return '#fb923c'
  if (color === 'dark') return '#64748b'
  return '#818cf8'
}

function MascotSettings({ settings, onChange, onClose }) {
  const set = (key, value) => onChange({ ...settings, [key]: value })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal mascot-settings-modal" onClick={(e) => e.stopPropagation()}>
        <h3>精灵设置</h3>

        {/* Live Preview */}
        <div className="preview-area">
          <PreviewMascot color={settings.color} shape={settings.shape} size={settings.size} />
        </div>

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
          <span className="setting-label">颜色 (13色)</span>
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
              >
                <span
                  className="size-dot"
                  style={{
                    width: 12 * s.scale,
                    height: 12 * s.scale,
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

export default MascotSettings
