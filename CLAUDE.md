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

All persisted on client side, no server DB. All helpers live in `utils/storage.js`:

| Key | Data | Shape |
|---|---|---|
| `ai-chat-sessions` | Sessions array | `[{id, title, messages, systemPrompt, createdAt}]` |
| `ai-chat-active` | Active session ID | `string` |
| `ai-chat-theme` | Theme | `"dark"` / `"light"` |
| `ai-chat-mascot` | Mascot settings | `{visible, color, shape, size, speechLang}` |
| `ai-chat-prompts` | Prompt templates | `[{id, name, content}]` |

State lifted to `App.jsx` with `useState` seeded from localStorage; `useEffect` persists on change.

## Component Tree

```
App
├── Sidebar (collapsible, 248→56px)
│   ├── Session list (new/switch/delete)
│   └── Footer: PromptLib, Mascot, Theme toggle buttons (SVG icons)
├── Main
│   ├── AppHeader (persona name / title, persona badge, clear button)
│   ├── ChatWindow (empty state with suggestion chips / message list)
│   │   └── MessageBubble (Markdown code blocks, **bold**, copy, regenerate)
│   ├── Mascot (draggable, click sparkles, drag-to-speak TTS, idle breathing)
│   └── ChatInput (text, voice, slash commands, web search toggle, send/stop)
├── SettingsModal (AI persona system prompt, presets)
├── MascotSettings (color, shape, size, visibility, speech language, live preview)
└── PromptLibrary (CRUD for /name prompt templates, search/filter)
```

## Shared Constants

`frontend/src/constants.js` — single source of truth for:
- `COLORS` (13 gradient entries), `SHAPES` (10 shape entries), `SIZES` (3), `LANGS` (10)
- `PRESETS` (5 AI persona presets), `MASCOT_MESSAGES` (click speech array)
- `earColor(color)` — maps color key to cat ear fill
- `findByValue(arr, value, fallbackIdx)` — lookup helper used by both Mascot and MascotSettings

## Key Patterns

**Prompt library + slash commands**: PromptLibrary modal manages `/name` templates (CRUD, localStorage). ChatInput detects `^/(\S*)$` regex on input, filters prompts by name, shows dropdown. Arrow keys navigate, Enter inserts full prompt content. Escape closes dropdown.

**Mascot drag-to-speak TTS**: Dragging the mascot over `.bubble` elements triggers `SpeechSynthesisUtterance` in the selected language. Uses two refs to track state:
- `readingElRef` — which DOM element is being read (preserved across drag moves for dedup)
- `readingRef` — boolean, whether reading is active (checked on move-away to stop)
- `hasMoved` ref — distinguishes click (< 3px) from drag; click plays random message, drag reads bubbles
- Reading continues after mouse release; stops only when dragged away from bubble or speech ends
- `stopReading()` cancels synthesis and sets `readingRef = false` without clearing `readingElRef`

**Message regeneration**: `handleRegenerate` finds the last user message before the clicked AI message, trims session messages to that point, passes trimmed array directly to `handleSend(text, baseMessages)` to avoid stale state.

**Theme**: CSS variables scoped to `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`. All colors use `var(--*)` tokens. Light/dark share identical selectors, just different variable values.

**Mascot customization**: 13 gradient colors, 10 shapes (border-radius variants + cat ears), 3 sizes, 10 speech languages. Settings modal has live animated preview. Eye pupils track mouse via `mousemove`.

**Mascot animations**: Three animation states driven by CSS classes on `.mascot-wrap`:
- `.idle` — slow breathing scale pulse (3.5s cycle) after 5s of no interaction; reset on click/drag
- `.dragging` — eyes squint to lines (pupils hidden), mouth becomes a pulsing circle
- `.reading` — body bounces, mouth animates in rapid talk cycle (0.25s), green "朗读中" bubble pulses

**Web search toggle**: Globe icon button in ChatInput toggles `webSearch` boolean in App state. Sent as `{webSearch: true/false}` in POST body to `/api/chat`. Backend can use this flag to inject search-augmented system instructions or call a search API.

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
