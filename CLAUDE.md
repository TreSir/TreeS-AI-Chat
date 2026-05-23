# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI chat assistant — React frontend + FastAPI backend, SSE-streamed responses from DeepSeek API. Deployed on Vercel (frontend) + Render (backend).

## Commands

```bash
# Backend (port 8000)
cd backend && python -m uvicorn main:app --reload

# Frontend (port 5173)
cd frontend && npm run dev

# Install
python -m pip install -r backend/requirements.txt
npm install --prefix frontend
```

Use `python -m` prefix — `pip`/`uvicorn` may not be on PATH on Windows.

## Architecture

```
Browser → Vercel (static) → fetch → Render (FastAPI) → DeepSeek API
                ↑ SSE streaming, AbortController for stop

Dev: Vite proxy /api → localhost:8000, no CORS issues
Prod: api.js uses VITE_API_URL env var, falls back to hardcoded Render URL
```

**SSE flow**: `POST /api/chat` receives `{messages, system}` → `chat.py` prepends system message → streams from DeepSeek → `data: {token}\n\n` → `data: [DONE]` → frontend accumulates tokens.

**Stop generation**: `api.js` exposes `createChatSender()` returning `{send, stop}`. `AbortController` cancels the fetch; `catch` block silently returns on `AbortError`.

**Mock mode**: When `DEEPSEEK_API_KEY` is unset or `sk-your-key-here` in `backend/.env`, `chat.py` yields a simulated character-by-character reply.

## State & Storage (localStorage)

All persisted on client side, no server DB:

| Key | Data | Handled in |
|---|---|---|
| `ai-chat-sessions` | `[{id, title, messages, systemPrompt, createdAt}]` | `utils/storage.js` |
| `ai-chat-active` | Active session ID string | `utils/storage.js` |
| `ai-chat-theme` | `"dark"` / `"light"` | `utils/storage.js` |
| `ai-chat-mascot` | `{visible, color, shape, size}` | inline in `App.jsx` |

State lifted to `App.jsx` with `useState` seeded from localStorage; `useEffect` persists on change.

## Component Tree

```
App
├── Sidebar (collapsible, 248→56px)
│   ├── Session list (new/switch/delete, localStorage)
│   └── Footer: Settings, Mascot, Theme toggle (all SVG icons)
├── Main
│   ├── AppHeader (title, persona badge, clear button)
│   ├── ChatWindow (empty state with suggestion chips / message list)
│   │   └── MessageBubble (Markdown code blocks, **bold**, copy, regenerate)
│   ├── Mascot (draggable, click interaction with sparkles + speech bubbles)
│   └── ChatInput (text, voice via Web Speech API, send/stop)
├── SettingsModal (AI persona system prompt, presets)
└── MascotSettings (color, shape, size, visibility, live preview)
```

## Key Patterns

**Message regeneration**: `handleRegenerate` finds the last user message before the clicked AI message, trims session messages to that point, passes trimmed array directly to `handleSend(text, baseMessages)` to avoid stale state.

**Theme**: CSS variables scoped to `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`. All colors use `var(--*)` tokens. Light/dark share identical selectors, just different variable values.

**Mascot customization**: `13` gradient colors, `10` shapes (border-radius variants + cat ears), `3` sizes. Settings modal has live animated preview. Eye pupils track mouse via `mousemove`.

**Voice input**: Web Speech API (`SpeechRecognition`), `interimResults: true` shows real-time text bubble, `requestAnimationFrame` drives sound-wave bars.

## Config

- `backend/.env` — `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL`. OpenAI-compatible `/v1/chat/completions` with `stream: true`.
- `backend/Dockerfile` — Python 3.12 slim, used by Render.
- `frontend/vite.config.js` — dev proxy `/api` → `localhost:8000`. In production, `api.js` uses `VITE_API_URL` + fallback URL.
- CORS in `main.py`: localhost:5173 for dev, vercel.app domains for prod.

## Deployment

- **Render** (backend): Dockerfile auto-detected, needs env vars `DEEPSEEK_API_KEY`. Free tier sleeps after 15 min inactivity.
- **Vercel** (frontend): Vite auto-detected, root dir `frontend`. Needs `VITE_API_URL` env var pointing to Render URL.
- Code on GitHub `TreSir/TreeS-AI-Chat`, both platforms auto-deploy on push to `main`.
