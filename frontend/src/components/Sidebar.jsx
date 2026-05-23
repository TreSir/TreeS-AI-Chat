function Sidebar({ sessions, activeId, onSelect, onNew, onDelete, onToggleSettings, onToggleMascot, theme, onToggleTheme }) {
  return (
    <aside className="sidebar">
      <button className="btn-new-chat" onClick={onNew}>
        新建对话
      </button>

      <div className="session-list">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`session-item ${s.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(s.id)}
          >
            <span className="session-title">{s.title || '新对话'}</span>
            <button
              className="btn-delete-session"
              onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="btn-sidebar-action" onClick={onToggleSettings}>
          人设配置
        </button>
        <button className="btn-sidebar-action" onClick={onToggleMascot}>
          精灵设置
        </button>
        <button className="btn-sidebar-action" onClick={onToggleTheme}>
          {theme === 'dark' ? '切换亮色' : '切换暗色'}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
