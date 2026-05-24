const SESSIONS_KEY = 'ai-chat-sessions'
const THEME_KEY = 'ai-chat-theme'
const ACTIVE_KEY = 'ai-chat-active'
const PROMPTS_KEY = 'ai-chat-prompts'
const MASCOT_KEY = 'ai-chat-mascot'

const tryParse = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback } catch { return fallback }
}

export function loadSessions() {
  return tryParse(localStorage.getItem(SESSIONS_KEY), [])
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

export function loadPrompts() {
  return tryParse(localStorage.getItem(PROMPTS_KEY), [])
}

export function savePrompts(prompts) {
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts))
}

export function loadMascot() {
  const defaults = { visible: true, color: 'violet', shape: 'blob', size: 'md', speechLang: 'zh-CN' }
  return { ...defaults, ...tryParse(localStorage.getItem(MASCOT_KEY), {}) }
}

export function saveMascot(mascot) {
  localStorage.setItem(MASCOT_KEY, JSON.stringify(mascot))
}
