# TreeS-AI-Chat

AI 聊天助手 — React 前端 + FastAPI 后端，SSE 流式响应，支持 DeepSeek API。部署于 Vercel（前端）+ Render（后端）。

## 功能

- **多会话管理** — 创建、切换、删除会话，每个会话独立的消息历史和系统提示词
- **流式对话** — SSE 实时推送，打字机效果，支持随时中断生成
- **Markdown 渲染** — 代码语法高亮（highlight.js）、标题、粗体、行内代码、无序列表
- **消息编辑** — 用户消息可编辑，编辑后自动重新生成 AI 回复
- **语音输入** — Web Speech API，支持实时语音转文字
- **吉祥物** — 可拖拽、点击互动，拖到消息气泡上朗读文字（TTS），三种动画状态（呼吸、拖拽、朗读）
- **吉祥物定制** — 13 种渐变色、10 种形状、3 种大小、10 种朗读语言，实时预览
- **暗色/亮色主题** — CSS 变量驱动，一键切换
- **提示词库** — 自定义 `/名称` 快捷提示词，斜杠命令面板搜索和插入
- **联网搜索开关** — 一键切换是否启用联网搜索
- **AI 人设** — 内置 5 种预设（通用助手、代码专家、中文老师、英语老师、心理咨询师），支持自定义

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + Vite |
| 后端 | FastAPI + Python |
| AI | DeepSeek API（OpenAI 兼容） |
| 通信 | SSE（Server-Sent Events） |
| 样式 | 纯 CSS（CSS 变量主题切换） |
| 部署 | Vercel（前端）+ Render（后端） |

## 快速开始

### 前提

- Node.js >= 18
- Python >= 3.10

### 安装

```bash
# 前端
cd frontend && npm install

# 后端
python -m pip install -r backend/requirements.txt
```

### 配置

在 `backend/.env` 中填写 DeepSeek API Key：

```
DEEPSEEK_API_KEY=sk-xxxxxxxx
```

不填则自动使用 Mock 模式，模拟流式回复方便开发调试。

### 运行

```bash
# 后端（端口 8000）
cd backend && python -m uvicorn main:app --reload

# 前端（端口 5173）
cd frontend && npm run dev
```

浏览器访问 `http://localhost:5173`。

### 部署

- **Render**：自动检测 Dockerfile，需设置 `DEEPSEEK_API_KEY` 环境变量
- **Vercel**：自动检测 Vite，root dir 设为 `frontend`，需设置 `VITE_API_URL` 指向 Render 后端地址

## 项目结构

```
T1/
├── backend/
│   ├── main.py              # FastAPI 入口，CORS
│   ├── chat.py              # 聊天路由 & AI 流式对接
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env                 # API Key（不提交）
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js       # 开发代理 /api → localhost:8000
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           # 主组件，状态中心
│       ├── App.css           # 全部样式
│       ├── api.js            # SSE 流式请求封装
│       ├── constants.js      # 共享常量（颜色、形状、预设等）
│       └── components/
│           ├── ChatWindow.jsx     # 消息列表
│           ├── MessageBubble.jsx  # 消息气泡（Markdown、编辑）
│           ├── ChatInput.jsx      # 输入框、语音、搜索开关
│           ├── Mascot.jsx         # 吉祥物（拖拽、TTS、动画）
│           ├── MascotSettings.jsx # 吉祥物设置面板
│           ├── Sidebar.jsx        # 侧边栏、会话列表
│           ├── SettingsModal.jsx  # AI 人设设置
│           └── PromptLibrary.jsx  # 提示词库管理
│           └── utils/
│               └── storage.js     # localStorage 读写封装
```

## 数据存储

所有数据存储在浏览器 localStorage，无服务端数据库：

| Key | 内容 |
|---|---|
| `ai-chat-sessions` | 会话列表 |
| `ai-chat-active` | 当前活动会话 ID |
| `ai-chat-theme` | 主题（dark/light） |
| `ai-chat-mascot` | 吉祥物设置 |
| `ai-chat-prompts` | 提示词模板 |

## License

MIT
