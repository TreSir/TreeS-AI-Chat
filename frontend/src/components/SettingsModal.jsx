import { useState } from 'react'

const PRESETS = [
  { label: '默认', prompt: '' },
  { label: '代码助手', prompt: '你是一个资深的编程专家，用简洁清晰的方式回答技术问题，给出可运行的代码示例。' },
  { label: '翻译官', prompt: '你是一个专业翻译，用户输入中文你翻译成英文，输入英文翻译成中文，只输出翻译结果。' },
  { label: '段子手', prompt: '你是一个幽默风趣的段子手，回答要轻松搞笑，多用梗和俏皮话。' },
  { label: '知识讲师', prompt: '你是一个耐心的老师，用通俗易懂的方式解释复杂概念，多用比喻和例子。' },
]

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
