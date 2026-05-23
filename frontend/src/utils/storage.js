const SESSIONS_KEY = 'ai-chat-sessions'
const THEME_KEY = 'ai-chat-theme'
const ACTIVE_KEY = 'ai-chat-active'

export function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function loadActiveId() {
  return localStorage.getItem(ACTIVE_KEY) || ''
}

export function saveActiveId(id) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark'
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}
