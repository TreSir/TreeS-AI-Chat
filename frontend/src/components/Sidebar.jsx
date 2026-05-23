function Sidebar({ sessions, activeId, collapsed, onToggleCollapse, onSelect, onNew, onDelete, onToggleSettings, onToggleMascot, theme, onToggleTheme }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Collapse toggle */}
      <button className="btn-collapse" onClick={onToggleCollapse} title={collapsed ? '展开侧栏' : '收起侧栏'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {collapsed
            ? <><polyline points="9 18 15 12 9 6" /></>
            : <><polyline points="15 18 9 12 15 6" /></>
          }
        </svg>
      </button>

      {/* New chat */}
      {!collapsed ? (
        <button className="btn-new-chat" onClick={onNew}>新建对话</button>
      ) : (
        <button className="btn-icon-only" onClick={onNew} title="新建对话">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      )}

      {/* Session list */}
      {!collapsed && (
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
      )}

      {/* Footer actions */}
      <div className="sidebar-footer">
        <button className="btn-sidebar-action" onClick={onToggleMascot} title="精灵设置">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="3" />
            <path d="M12 2a8 8 0 0 0-8 8c0 5.4 6.4 11.2 7.3 12 .3.3.8.3 1.1 0C13.6 21.2 20 15.4 20 10a8 8 0 0 0-8-8z" />
          </svg>
          {!collapsed && <span>精灵设置</span>}
        </button>

        <button className="btn-sidebar-action" onClick={onToggleTheme} title={theme === 'dark' ? '切换亮色' : '切换暗色'}>
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          {!collapsed && <span>{theme === 'dark' ? '切换亮色' : '切换暗色'}</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
