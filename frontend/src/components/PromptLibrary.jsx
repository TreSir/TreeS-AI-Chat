import { useState } from 'react'

function PromptLibrary({ prompts, onSave, onDelete, onClose }) {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return
    onSave({ id: editingId || Date.now().toString(), name: name.trim(), content: content.trim() })
    setName('')
    setContent('')
    setEditingId(null)
  }

  const handleEdit = (p) => {
    setName(p.name)
    setContent(p.content)
    setEditingId(p.id)
  }

  const handleCancel = () => {
    setName('')
    setContent('')
    setEditingId(null)
  }

  const filtered = prompts.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal prompt-lib-modal" onClick={(e) => e.stopPropagation()}>
        <h3>提示词库</h3>
        <p className="modal-desc">创建常用提示词模板，在聊天框输入 /名称 即可快速调用</p>

        {/* Add / Edit form */}
        <form className="prompt-form" onSubmit={handleSubmit}>
          <input
            className="prompt-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="提示词名称，如：翻译"
          />
          <textarea
            className="prompt-content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="提示词内容，如：请将以下内容翻译成英文："
            rows={3}
          />
          <div className="prompt-form-actions">
            {editingId && (
              <button type="button" className="btn-cancel" onClick={handleCancel}>取消编辑</button>
            )}
            <button type="submit" className="btn-save" disabled={!name.trim() || !content.trim()}>
              {editingId ? '更新' : '添加'}
            </button>
          </div>
        </form>

        {/* Search + List */}
        {prompts.length > 0 && (
          <>
            <input
              className="prompt-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索已有提示词..."
            />
            <div className="prompt-list">
              {filtered.map((p) => (
                <div key={p.id} className="prompt-item">
                  <div className="prompt-item-info">
                    <span className="prompt-item-name">/{p.name}</span>
                    <span className="prompt-item-preview">{p.content.slice(0, 60)}{p.content.length > 60 ? '…' : ''}</span>
                  </div>
                  <div className="prompt-item-actions">
                    <button className="bubble-btn" onClick={() => handleEdit(p)} title="编辑">✎</button>
                    <button className="bubble-btn" onClick={() => onDelete(p.id)} title="删除">×</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="prompt-empty">没有匹配的提示词</p>
              )}
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}

export default PromptLibrary
