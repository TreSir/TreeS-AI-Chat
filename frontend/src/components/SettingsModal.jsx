import { useState } from 'react'
import { PRESETS } from '../constants'

function SettingsModal({ currentPrompt, onSave, onClose }) {
  const [prompt, setPrompt] = useState(currentPrompt || '')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>AI 人设配置</h3>
        <p className="modal-desc">给 AI 设定一个角色或风格，让它按你的要求回答。</p>

        <div className="presets">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className={`preset-chip ${prompt === p.prompt ? 'active' : ''}`}
              onClick={() => setPrompt(p.prompt)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <textarea
          className="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="自定义人设提示词，例如：你是一个..."
          rows={4}
        />

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button className="btn-save" onClick={() => onSave(prompt)}>保存</button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
