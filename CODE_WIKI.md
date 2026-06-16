# TreeS-AI-Chat Code Wiki

## 1. 项目概述

**TreeS-AI-Chat** 是一个 AI 聊天助手应用，采用前后端分离架构。前端基于 React 18 + Vite 构建，后端使用 FastAPI + Python，通过 SSE（Server-Sent Events）实现流式对话，AI 能力由 DeepSeek API（OpenAI 兼容接口）提供。前端部署于 Vercel，后端部署于 Render。

核心特性：多会话管理、流式对话、Markdown 渲染、消息编辑与重新生成、语音输入、可定制吉祥物（拖拽/TTS/动画）、暗色/亮色主题、提示词库（斜杠命令）、联网搜索开关、AI 人设预设。

---

## 2. 项目架构

### 2.1 整体架构图

```
┌──────────────┐       HTTP/SSE        ┌──────────────┐      HTTP/Stream      ┌──────────────┐
│   Browser    │  ──── POST /api/chat ──→│   FastAPI    │  ──── /v1/chat/     │  DeepSeek    │
│  (React SPA) │  ←── SSE data: token ──│   Backend    │  ←── completions ──│    API       │
└──────────────┘                        └──────────────┘                      └──────────────┘
     ↑                                       ↑
     │  localStorage                         │  .env
     │  (全量持久化)                          │  DEEPSEEK_API_KEY
```

### 2.2 请求流程

1. 用户在 ChatInput 输入消息，点击发送
2. `App.jsx` 调用 `sender.send()`（来自 `api.js` 的 `createChatSender`）
3. `api.js` 发起 `POST /api/chat` 请求，携带 `{messages, system, webSearch}`
4. 后端 `main.py` 接收请求，将 system prompt 插入消息头部
5. `chat.py` 调用 DeepSeek API（stream: true），逐 token 转发 SSE
6. 前端通过 `ReadableStream` 逐行解析 `data: {token}\n\n`，回调 `onToken` 更新 UI
7. 流结束时收到 `data: [DONE]`，前端调用 `onDone`

### 2.3 开发/生产通信方式

| 环境 | 前端 → 后端 | 说明 |
|------|-------------|------|
| 开发 | Vite 代理 `/api` → `localhost:8000` | 无跨域问题 |
| 生产 | `VITE_API_URL` 环境变量指定后端地址 | 回退到 `https://trees-ai-chat.onrender.com` |

---

## 3. 目录结构

```
TreeS-AI-Chat/
├── backend/
│   ├── main.py              # FastAPI 应用入口，CORS 中间件，路由定义
│   ├── chat.py              # 聊天逻辑：DeepSeek API 流式调用 & Mock 模式
│   ├── requirements.txt     # Python 依赖
│   ├── Dockerfile           # 容器化部署配置
│   └── .env                 # 环境变量（不提交，含 API Key）
├── frontend/
│   ├── index.html           # HTML 入口
│   ├── package.json         # 前端依赖与脚本
│   ├── vite.config.js       # Vite 配置（开发代理）
│   ├── .env.production      # 生产环境变量
│   └── src/
│       ├── main.jsx         # React 挂载入口
│       ├── App.jsx          # 主组件，全局状态中心
│       ├── App.css          # 全局样式（CSS 变量主题系统）
│       ├── api.js           # SSE 流式请求封装
│       ├── constants.js     # 共享常量（颜色、形状、预设等）
│       ├── components/
│       │   ├── ChatWindow.jsx      # 消息列表与空状态
│       │   ├── MessageBubble.jsx   # 消息气泡（Markdown 渲染、编辑、复制）
│       │   ├── ChatInput.jsx       # 输入框、语音、斜杠命令、联网搜索
│       │   ├── VoiceButton.jsx     # 语音输入（Web Speech API）
│       │   ├── Sidebar.jsx         # 侧边栏、会话管理
│       │   ├── SettingsModal.jsx   # AI 人设设置弹窗
│       │   ├── Mascot.jsx          # 吉祥物（拖拽、TTS、动画）
│       │   ├── MascotSettings.jsx  # 吉祥物定制面板
│       │   └── PromptLibrary.jsx   # 提示词库管理
│       └── utils/
│           └── storage.js          # localStorage 读写封装
├── README.md
├── CLAUDE.md
└── .gitignore
```

---

## 4. 后端模块详解

### 4.1 `main.py` — 应用入口

**职责**：FastAPI 应用初始化、CORS 中间件配置、聊天路由定义。

| 项 | 说明 |
|----|------|
| `app` | FastAPI 实例，`title="AI Chat Assistant"` |
| CORS 允许源 | `localhost:5173`（开发）、`tree-s-ai-chat.vercel.app`（生产） |
| `ChatRequest` | Pydantic 模型，字段：`messages: list[dict]`、`system: str = ""` |
| `POST /api/chat` | 接收聊天请求，返回 `StreamingResponse`（`text/event-stream`） |

**核心逻辑**：

```python
@app.post("/api/chat")
async def chat(req: ChatRequest):
    # 如果有 system prompt，插入到消息列表头部
    # 调用 chat.stream_chat 异步迭代器，逐 token 生成 SSE 事件
    # 格式：data: {token}\n\n，结束时 data: [DONE]\n\n
```

### 4.2 `chat.py` — 聊天核心逻辑

**职责**：封装 DeepSeek API 的流式调用，以及无 API Key 时的 Mock 模式。

| 项 | 说明 |
|----|------|
| `API_KEY` | 从环境变量 `DEEPSEEK_API_KEY` 读取 |
| `BASE_URL` | 从环境变量 `DEEPSEEK_BASE_URL` 读取，默认 `https://api.deepseek.com` |
| `MODEL` | 从环境变量 `DEEPSEEK_MODEL` 读取，默认 `deepseek-chat` |

#### `stream_chat(messages: list[dict])` → `AsyncGenerator[str]`

- **Mock 模式**：当 `API_KEY` 为空或为 `"sk-your-key-here"` 时，调用 `mock_stream` 逐字符输出模拟回复
- **真实模式**：使用 `httpx.AsyncClient` 发起流式 POST 请求到 `{BASE_URL}/v1/chat/completions`
  - 请求体：`{model, messages, stream: true}`
  - 逐行解析 SSE 响应，提取 `delta.content` 并 yield
  - 超时设置：60 秒

#### `mock_stream(messages: list[dict])` → `AsyncGenerator[str]`

- 模拟流式回复，逐字符 yield，方便无 API Key 时开发调试

### 4.3 `Dockerfile`

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

Render 自动检测此 Dockerfile，`PORT` 环境变量由平台注入。

---

## 5. 前端模块详解

### 5.1 组件树

```
App (状态中心)
├── Sidebar (可折叠，248px ↔ 56px)
│   ├── 折叠按钮
│   ├── 新建对话按钮
│   ├── 会话列表（切换/删除）
│   └── Footer: 提示词库、精灵设置、主题切换
├── Main
│   ├── AppHeader (人设名称、人设徽章、清空按钮)
│   ├── ChatWindow (空状态建议 / 消息列表)
│   │   └── MessageBubble (Markdown、代码高亮、编辑、复制、重新生成)
│   ├── Mascot (可拖拽、点击互动、TTS 朗读、动画)
│   └── ChatInput (文本输入、语音、斜杠命令、联网搜索、发送/停止)
├── SettingsModal (AI 人设系统提示词，5 种预设)
├── MascotSettings (颜色/形状/大小/可见性/朗读语言，实时预览)
└── PromptLibrary (提示词 CRUD，搜索过滤)
```

### 5.2 `App.jsx` — 状态中心

**职责**：全局状态管理、事件处理、子组件编排。

#### 状态定义

| 状态 | 类型 | 初始值来源 | 持久化 Key |
|------|------|-----------|-----------|
| `sessions` | `Session[]` | `loadSessions()` | `ai-chat-sessions` |
| `activeId` | `string` | `loadActiveId()` | `ai-chat-active` |
| `streaming` | `boolean` | `false` | — |
| `showSettings` | `boolean` | `false` | — |
| `showMascotSettings` | `boolean` | `false` | — |
| `theme` | `'dark' \| 'light'` | `loadTheme()` | `ai-chat-theme` |
| `mascot` | `MascotSettings` | `loadMascot()` | `ai-chat-mascot` |
| `sidebarCollapsed` | `boolean` | `false` | — |
| `prompts` | `Prompt[]` | `loadPrompts()` | `ai-chat-prompts` |
| `showPromptLib` | `boolean` | `false` | — |
| `webSearch` | `boolean` | `false` | — |

#### 数据模型

```typescript
interface Session {
  id: string          // Date.now().toString()
  title: string       // 首条消息前 30 字符，默认 "新对话"
  messages: Message[]
  systemPrompt: string
  createdAt: number
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface Prompt {
  id: string
  name: string        // 斜杠命令名称
  content: string     // 提示词内容
}

interface MascotSettings {
  visible: boolean
  color: string       // COLORS 中的 value
  shape: string       // SHAPES 中的 value
  size: string        // SIZES 中的 value
  speechLang: string  // LANGS 中的 value
}
```

#### 关键函数

| 函数 | 说明 |
|------|------|
| `createSession()` | 创建新会话对象，id 基于时间戳 |
| `getPersonaName(prompt)` | 从 PRESETS 匹配人设名称，自定义则截取前 12 字符 |
| `ensureSession()` | 确保有活动会话，无则自动创建 |
| `updateSession(id, updater)` | 函数式更新指定会话 |
| `handleSend(text, baseMessages?)` | 发送消息核心逻辑：追加用户消息 → 追加空 AI 消息 → 流式填充 |
| `handleStop()` | 中断流式生成（AbortController） |
| `handleEditMessage(msgIndex, newText)` | 编辑用户消息：截断到该位置，重新发送 |
| `handleRegenerate(msgIndex)` | 重新生成 AI 回复：找到前一条用户消息，截断后重新发送 |
| `handleSaveSystemPrompt(prompt)` | 保存 AI 人设到当前会话 |
| `handleSavePrompt(prompt)` | 新增或更新提示词模板 |
| `handleDeletePrompt(id)` | 删除提示词模板 |
| `handleToggleTheme()` | 切换暗色/亮色主题 |

### 5.3 `api.js` — SSE 流式请求封装

**职责**：封装与后端的 SSE 通信，支持中断。

#### `createChatSender()` → `{send, stop}`

| 方法 | 说明 |
|------|------|
| `send(messages, system, {onToken, onDone, webSearch})` | 发起 POST 请求，通过 ReadableStream 逐行解析 SSE 事件，`onToken` 回调每个 token |
| `stop()` | 调用 `AbortController.abort()` 中断请求 |

**API 地址解析**：

```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'https://trees-ai-chat.onrender.com'
```

**SSE 解析逻辑**：
1. 使用 `response.body.getReader()` 读取流
2. 按 `\n` 分行，处理 `data: ` 前缀
3. 忽略空行和 `[DONE]`，其余作为 token 回调
4. `AbortError` 静默处理（用户主动中断）

### 5.4 `constants.js` — 共享常量

| 导出 | 类型 | 说明 |
|------|------|------|
| `COLORS` | `Array<{label, value, css}>` | 13 种渐变色（紫罗兰、蜜桃粉、天空蓝等） |
| `SHAPES` | `Array<{label, value, radius}>` | 10 种形状（团子、猫猫、圆圆等），通过 `border-radius` 实现 |
| `SIZES` | `Array<{label, value, scale}>` | 3 种大小（小 0.75、中 1、大 1.35） |
| `LANGS` | `Array<{label, value}>` | 10 种朗读语言 |
| `PRESETS` | `Array<{label, prompt}>` | 5 种 AI 人设预设（默认、代码助手、翻译官、段子手、知识讲师） |
| `MASCOT_MESSAGES` | `string[]` | 吉祥物点击时的随机消息 |
| `earColor(color)` | `function` | 根据颜色 key 返回猫耳朵填充色 |
| `findByValue(arr, value, fallback)` | `function` | 按 value 字段查找数组项，未找到则返回 fallback 索引项 |

### 5.5 `utils/storage.js` — localStorage 封装

**职责**：统一管理所有 localStorage 读写，带 JSON 安全解析。

| 函数 | Key | 默认值 |
|------|-----|--------|
| `loadSessions()` / `saveSessions()` | `ai-chat-sessions` | `[]` |
| `loadActiveId()` / `saveActiveId()` | `ai-chat-active` | `''` |
| `loadTheme()` / `saveTheme()` | `ai-chat-theme` | `'dark'` |
| `loadPrompts()` / `savePrompts()` | `ai-chat-prompts` | `[]` |
| `loadMascot()` / `saveMascot()` | `ai-chat-mascot` | `{visible:true, color:'violet', shape:'blob', size:'md', speechLang:'zh-CN'}` |

内部工具函数 `tryParse(raw, fallback)` 安全解析 JSON，解析失败返回 fallback。

### 5.6 组件详解

#### `ChatWindow.jsx`

**职责**：渲染消息列表或空状态页面。

| Props | 说明 |
|-------|------|
| `messages` | 当前会话消息数组 |
| `onSend` | 发送消息回调（空状态建议按钮使用） |
| `onRegenerate` | 重新生成回调 |
| `onEdit` | 编辑消息回调 |
| `streaming` | 是否正在流式生成 |

- 空状态：显示 5 个建议芯片（如"用 Python 写一个快速排序"）
- 有消息时：遍历渲染 `MessageBubble`，自动滚动到底部（`scrollIntoView`）

#### `MessageBubble.jsx`

**职责**：单条消息渲染，支持 Markdown、代码高亮、编辑、复制、重新生成。

**内部组件**：

| 组件/函数 | 说明 |
|-----------|------|
| `CodeBlock({code, lang})` | 代码块渲染，使用 highlight.js 语法高亮，支持复制 |
| `highlightCode(code, lang)` | 调用 hljs 高亮代码，支持指定语言或自动检测 |
| `processMarkdown(text)` | 轻量 Markdown 转 HTML：标题(h1-h3)、粗体、行内代码、无序列表、换行 |
| `renderContent(text)` | 解析文本中的 ` ``` ` 代码块，其余走 Markdown 渲染 |

**交互功能**：
- 用户消息：编辑按钮 → 进入 textarea 编辑模式（Enter 保存，Esc 取消）
- AI 消息：复制按钮、重新生成按钮（仅最后一条 AI 消息）
- 流式中：显示闪烁光标（`.typing-cursor`）

#### `ChatInput.jsx`

**职责**：消息输入框，集成语音、斜杠命令、联网搜索。

| Props | 说明 |
|-------|------|
| `onSend` | 发送消息回调 |
| `disabled` | 是否禁用输入 |
| `streaming` | 是否流式生成中 |
| `onStop` | 停止生成回调 |
| `prompts` | 提示词模板数组 |
| `webSearch` | 联网搜索状态 |
| `onToggleWebSearch` | 切换联网搜索 |

**斜杠命令逻辑**：
1. 监听输入，正则 `^\/(\S*)$` 匹配斜杠命令
2. 按名称过滤提示词模板，最多显示 6 条
3. 上下键导航，Enter 插入完整内容，Esc 关闭下拉

#### `VoiceButton.jsx`

**职责**：语音输入按钮，使用 Web Speech API。

| Props | 说明 |
|-------|------|
| `onResult` | 语音识别完成回调，参数为识别文本 |

**实现细节**：
- 使用 `window.SpeechRecognition || window.webkitSpeechRecognition`
- `interimResults: true` 实时显示中间结果
- `requestAnimationFrame` 驱动声波动画条
- 识别语言固定为 `zh-CN`

#### `Sidebar.jsx`

**职责**：侧边栏，会话管理与功能入口。

| Props | 说明 |
|-------|------|
| `sessions` | 会话列表 |
| `activeId` | 当前活动会话 ID |
| `collapsed` | 是否折叠 |
| `onToggleCollapse` | 切换折叠 |
| `onSelect` | 选择会话 |
| `onNew` | 新建对话 |
| `onDelete` | 删除会话 |
| `onToggleSettings` | 打开人设设置 |
| `onToggleMascot` | 打开精灵设置 |
| `onTogglePromptLib` | 打开提示词库 |
| `theme` | 当前主题 |
| `onToggleTheme` | 切换主题 |

- 折叠态：宽度 56px，仅显示图标按钮
- 展开态：宽度 248px，显示会话列表和功能文字

#### `SettingsModal.jsx`

**职责**：AI 人设配置弹窗。

| Props | 说明 |
|-------|------|
| `currentPrompt` | 当前系统提示词 |
| `onSave` | 保存回调 |
| `onClose` | 关闭回调 |

- 显示 5 个预设芯片（来自 `PRESETS`）
- 支持自定义文本输入

#### `Mascot.jsx`

**职责**：可交互吉祥物，支持拖拽、点击、TTS 朗读、动画。

| Props | 说明 |
|-------|------|
| `settings` | MascotSettings 对象 |

**核心交互**：

| 交互 | 行为 |
|------|------|
| 点击（移动 < 3px） | 随机显示 MASCOT_MESSAGES 中的消息，播放弹跳动画 + 火花特效 |
| 拖拽 | 自由移动位置，眼睛眯成线，嘴巴变成脉动圆 |
| 拖拽到消息气泡上 | 使用 `SpeechSynthesisUtterance` 朗读气泡文字（TTS） |
| 拖离气泡 | 停止朗读 |
| 5 秒无交互 | 进入呼吸动画（idle 状态） |

**动画状态**（CSS 类驱动）：

| 类名 | 效果 |
|------|------|
| `.idle` | 身体缓慢呼吸缩放（3.5s 周期） |
| `.dragging` | 眼睛眯成线、瞳孔隐藏、嘴巴脉动 |
| `.reading` | 身体弹跳、嘴巴快速张合（0.25s）、绿色"朗读中"气泡 |
| `.bounced` | 点击弹跳动画（0.4s） |

**眼球追踪**：全局 `mousemove` 事件，计算鼠标与眼球中心的角度和距离，通过 `transform: translate()` 移动瞳孔。

**TTS 关键 Refs**：
- `readingElRef` — 当前正在朗读的 DOM 元素（跨拖拽移动去重）
- `readingRef` — 是否正在朗读（布尔值，拖离时检查）
- `hasMoved` — 区分点击与拖拽（移动距离 < 3px 视为点击）

#### `MascotSettings.jsx`

**职责**：吉祥物定制面板，含实时预览。

| Props | 说明 |
|-------|------|
| `settings` | 当前吉祥物设置 |
| `onChange` | 设置变更回调 |
| `onClose` | 关闭回调 |

**内部组件**：`PreviewMascot` — 实时预览吉祥物外观（颜色、形状、大小、猫耳朵）。

**可配置项**：
- 显示/隐藏开关
- 13 种渐变色
- 10 种形状
- 3 种大小
- 10 种朗读语言

#### `PromptLibrary.jsx`

**职责**：提示词模板管理（CRUD）。

| Props | 说明 |
|-------|------|
| `prompts` | 提示词数组 |
| `onSave` | 保存回调（新增或更新） |
| `onDelete` | 删除回调 |
| `onClose` | 关闭回调 |

- 表单：名称输入 + 内容输入
- 列表：搜索过滤 + 编辑/删除操作
- 编辑模式：填充表单，按钮变为"更新"

---

## 6. 样式架构

### 6.1 主题系统

采用 CSS 变量驱动，通过 `<html>` 元素的 `data-theme` 属性切换。

```css
:root, [data-theme="dark"] { /* 暗色变量 */ }
[data-theme="light"] { /* 亮色变量 */ }
```

**设计令牌（Design Tokens）**：

| 变量 | 用途 | 暗色值 | 亮色值 |
|------|------|--------|--------|
| `--bg-root` | 页面底色 | `#0d0d0f` | `#f5f5f7` |
| `--bg-surface` | 表面色 | `#141418` | `#fafafa` |
| `--bg-elevated` | 提升色 | `#1a1a1f` | `#ffffff` |
| `--accent` | 主色调 | `#6366f1` | `#6366f1` |
| `--text` | 主文字 | `#ededef` | `#1d1d1f` |
| `--border` | 边框 | `#222228` | `#e5e5ea` |
| `--user-bubble` | 用户气泡 | `#6366f1` | `#6366f1` |
| `--code-bg` | 代码背景 | `#111115` | `#f5f5f7` |

### 6.2 代码高亮

使用 highlight.js，通过 `[data-theme]` 选择器覆盖暗色/亮色下的语法高亮颜色（GitHub 风格）。

### 6.3 布局

- `.app-layout`：Flex 横向布局，100vh
- `.sidebar`：固定宽度 248px，折叠 56px
- `.main`：Flex 纵向布局，flex: 1

---

## 7. 依赖关系

### 7.1 后端依赖

| 包 | 版本 | 用途 |
|----|------|------|
| `fastapi` | — | Web 框架 |
| `uvicorn[standard]` | — | ASGI 服务器 |
| `httpx` | — | 异步 HTTP 客户端（调用 DeepSeek API） |
| `python-dotenv` | — | 读取 .env 环境变量 |

### 7.2 前端依赖

| 包 | 版本 | 用途 |
|----|------|------|
| `react` | ^18.3.1 | UI 框架 |
| `react-dom` | ^18.3.1 | React DOM 渲染 |
| `highlight.js` | ^11.11.1 | 代码语法高亮 |

### 7.3 前端开发依赖

| 包 | 版本 | 用途 |
|----|------|------|
| `vite` | ^5.4.2 | 构建工具 |
| `@vitejs/plugin-react` | ^4.3.1 | Vite React 插件 |

### 7.4 模块依赖图

```
App.jsx
├── api.js (createChatSender)
├── constants.js (PRESETS)
├── utils/storage.js (load/save 函数)
├── components/Sidebar.jsx
├── components/ChatWindow.jsx
│   └── components/MessageBubble.jsx
│       └── highlight.js
├── components/ChatInput.jsx
│   └── components/VoiceButton.jsx
├── components/Mascot.jsx
│   └── constants.js (COLORS, SHAPES, SIZES, MASCOT_MESSAGES, earColor, findByValue)
├── components/SettingsModal.jsx
│   └── constants.js (PRESETS)
├── components/MascotSettings.jsx
│   └── constants.js (COLORS, SHAPES, SIZES, LANGS, earColor, findByValue)
└── components/PromptLibrary.jsx
```

---

## 8. 数据流

### 8.1 状态流

```
localStorage ──load──→ App.useState ──props──→ 子组件
                        │
                        └──useEffect──save──→ localStorage
```

所有持久化数据通过 `useState` 初始化时从 localStorage 读取，变更时通过 `useEffect` 写回。App 是唯一的状态中心，子组件通过 props 接收数据和回调。

### 8.2 消息流

```
用户输入 → ChatInput.onSubmit → App.handleSend
  → 追加 user message 到 session.messages
  → 追加空 assistant message
  → sender.send(messages, systemPrompt, {onToken, onDone, webSearch})
    → POST /api/chat → FastAPI → DeepSeek API
    ← SSE data: token ← chat.py stream_chat
    → onToken: 逐 token 更新 assistant message content
    → onDone: setStreaming(false)
```

### 8.3 中断流

```
用户点击"停止" → ChatInput.onStop → App.handleStop
  → sender.stop() → AbortController.abort()
  → fetch 抛出 AbortError → catch 静默返回
  → setStreaming(false)
```

---

## 9. 环境配置

### 9.1 后端环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `DEEPSEEK_API_KEY` | 否 | 空 | DeepSeek API 密钥，不填则进入 Mock 模式 |
| `DEEPSEEK_BASE_URL` | 否 | `https://api.deepseek.com` | API 基础 URL（OpenAI 兼容） |
| `DEEPSEEK_MODEL` | 否 | `deepseek-chat` | 模型名称 |
| `PORT` | 否 | `8000` | 服务端口（Render 平台注入） |

### 9.2 前端环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `VITE_API_URL` | 否 | `https://trees-ai-chat.onrender.com` | 后端 API 地址 |

---

## 10. 运行与部署

### 10.1 本地开发

**前提**：Node.js >= 18、Python >= 3.10

```bash
# 安装后端依赖
python -m pip install -r backend/requirements.txt

# 安装前端依赖
cd frontend && npm install

# 配置 API Key（可选，不配则 Mock 模式）
echo "DEEPSEEK_API_KEY=sk-xxxxxxxx" > backend/.env

# 启动后端（端口 8000）
cd backend && python -m uvicorn main:app --reload

# 启动前端（端口 5173）
cd frontend && npm run dev
```

浏览器访问 `http://localhost:5173`。Vite 开发服务器自动将 `/api` 代理到 `localhost:8000`。

### 10.2 生产部署

| 平台 | 服务 | 配置 |
|------|------|------|
| Render | 后端 | 自动检测 Dockerfile，设置环境变量 `DEEPSEEK_API_KEY` |
| Vercel | 前端 | Root dir 设为 `frontend`，设置 `VITE_API_URL` 指向 Render 后端地址 |

两个平台均监听 GitHub `main` 分支，推送后自动部署。

### 10.3 构建命令

```bash
# 前端构建
cd frontend && npm run build

# 前端预览构建产物
cd frontend && npm run preview
```

---

## 11. 关键设计模式

### 11.1 状态提升 + localStorage 持久化

所有状态提升到 `App.jsx`，通过 `useState` 初始化从 localStorage 读取，`useEffect` 在变更时写回。子组件纯展示 + 回调，无内部持久化。

### 11.2 SSE 流式通信

前端使用原生 `fetch` + `ReadableStream` 读取 SSE，不依赖 EventSource（因需 POST 请求）。后端使用 FastAPI 的 `StreamingResponse` + `async generator`。

### 11.3 AbortController 中断机制

`createChatSender()` 返回 `{send, stop}`，内部维护 `AbortController` 实例。`stop()` 调用 `abort()`，fetch 的 catch 块对 `AbortError` 静默处理。

### 11.4 CSS 变量主题

通过 `<html data-theme="dark|light">` 切换，所有颜色使用 `var(--*)` 引用。暗色/亮色共享相同选择器，仅变量值不同。

### 11.5 消息编辑与重新生成

- **编辑**：截断消息到编辑位置，以新文本重新发送
- **重新生成**：找到 AI 消息之前的最后一条用户消息，截断后重新发送
- 两者都通过 `handleSend(text, baseMessages)` 的第二个参数传入截断后的消息列表，避免闭包中的过期状态

### 11.6 吉祥物拖拽朗读

拖拽时通过 `document.elementsFromPoint()` 检测鼠标下方的 `.bubble` 元素，触发 `SpeechSynthesisUtterance`。使用 `readingElRef` 去重（同一气泡不重复朗读），`readingRef` 跟踪朗读状态（拖离时停止）。
