import { COLORS, SHAPES, SIZES, LANGS, earColor, findByValue } from '../constants'

function PreviewMascot({ color, shape, size }) {
  const s = findByValue(SHAPES, shape, 0)
  const c = findByValue(COLORS, color, 0)
  const sc = findByValue(SIZES, size, 1)
  const base = 48 * sc.scale
  const isCat = shape === 'cat'

  return (
    <div className="preview-mascot">
      <div className="preview-float" style={{ transform: `scale(${sc.scale})` }}>
        {isCat && (
          <div className="preview-ears">
            <div className="preview-ear left" style={{ borderBottomColor: earColor(color) }} />
            <div className="preview-ear right" style={{ borderBottomColor: earColor(color) }} />
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

function MascotSettings({ settings, onChange, onClose }) {
  const set = (key, value) => onChange({ ...settings, [key]: value })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal mascot-settings-modal" onClick={(e) => e.stopPropagation()}>
        <h3>精灵设置</h3>

        <div className="preview-area">
          <PreviewMascot color={settings.color} shape={settings.shape} size={settings.size} />
        </div>

        <label className="setting-row">
          <span className="setting-label">显示精灵</span>
          <button
            className={`toggle-switch ${settings.visible ? 'on' : 'off'}`}
            onClick={() => set('visible', !settings.visible)}
          >
            <span className="toggle-knob" />
          </button>
        </label>

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

        <div className="setting-section">
          <span className="setting-label">精灵语言</span>
          <div className="lang-grid">
            {LANGS.map((l) => (
              <button
                key={l.value}
                className={`lang-chip ${settings.speechLang === l.value ? 'active' : ''}`}
                onClick={() => set('speechLang', l.value)}
              >
                {l.label}
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
