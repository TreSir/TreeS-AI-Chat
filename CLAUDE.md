# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI chat assistant — React frontend + FastAPI backend, SSE-streamed responses from DeepSeek API.

## Commands

```bash
# Backend (port 8000)
cd backend
python -m uvicorn main:app --reload

# Frontend (port 5173)
cd frontend
npm run dev
```

Install deps: `python -m pip install -r backend/requirements.txt` / `npm install --prefix frontend`

Python scripts use `python -m` prefix since `pip`/`uvicorn` may not be on PATH.

## Architecture

```
Browser ← SSE stream ← Vite proxy (:5173 → :8000) ← FastAPI ← DeepSeek API
```

**SSE flow**: `api.js` → `POST /api/chat` → `chat.py` streams from DeepSeek → yields `data: {token}\n\n` → frontend accumulates tokens into the last assistant message.

**Mock mode**: When `DEEPSEEK_API_KEY` is unset or `sk-your-key-here` in `backend/.env`, `chat.py` falls back to a simulated character-by-character reply — no API call made.

**Vite proxy** (`vite.config.js`): All `/api/*` requests forwarded to `http://localhost:8000`, so the frontend calls `fetch('/api/chat')` with no CORS issues in dev.

**Config**: `backend/.env` — `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL`. Uses OpenAI-compatible `/v1/chat/completions` endpoint with `stream: true`.
