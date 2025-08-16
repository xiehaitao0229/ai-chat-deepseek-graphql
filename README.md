# 🤖 DeepSeek AI Chat Interface (GraphQL)

一个基于 React + GraphQL + Cloudflare Worker 的 DeepSeek AI 聊天界面

## 🏗️ 架构图

```
前端 React App → GraphQL Server → DeepSeek Cloudflare Worker → DeepSeek API
```
```

```

---

## 💻 前端项目启动

### 📥 安装依赖

```bash
cd ai-chat-interface
pnpm install
```

### 🎯 核心组件

主要逻辑代码位于 `AIChatInterface` 组件中，包含：

- 🎨 **UI 界面**: React + Tailwind CSS
- 🔄 **GraphQL 查询**: 与 Worker 通信
- 💬 **聊天功能**: 消息发送/接收
- ⚙️ **设置面板**: 模型选择、参数调整

### 🚀 启动项目

```bash
# 开发模式
pnpm start

# 构建生产版本
pnpm build
```

---

## 🌟 功能特性

- ✨ **GraphQL 查询**: 统一的 API 接口
- 🎛️ **模型选择**: 支持 DeepSeek Chat/Coder
- 📊 **Token 统计**: 实时显示使用情况
- 💾 **本地存储**: 自动保存配置
- 📱 **响应式**: 适配移动端
- 🎨 **美观界面**: 现代化 UI 设计

---

## 🔧 配置说明

在前端界面的设置面板中，你可以配置：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| Worker URL | GraphQL Worker 地址 | - |
| 模型 | AI 模型选择 | `deepseek-chat` |
| 最大 Tokens | 响应长度限制 | `1000` |
| 创造性 | 回答随机性 | `0.7` |

---

## 📚 技术文档

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [GraphQL](https://graphql.org/)
- [DeepSeek API](https://platform.deepseek.com/)
- [React](https://reactjs.org/)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

**技术栈：**
- 🎨 **前端**: React + TypeScript + Tailwind CSS
- 🌐 **中间层**: Cloudflare Worker + GraphQL
- 🤖 **AI API**: DeepSeek Chat/Coder Models

---

## 🚀 快速开始

### 📋 前置要求

- Node.js 16+
- Cloudflare 账户
- DeepSeek API Key

---

## 🛠️ 服务器端部署 (Cloudflare Worker)

### 📦 步骤 1: 安装 Wrangler CLI

```bash
npm install -g @cloudflare/wrangler
```

### 🔐 步骤 2: 登录 Cloudflare

```bash
wrangler login
```

### 📁 步骤 3: 创建项目

```bash
# 创建新目录
mkdir deepseek-graphql-worker
cd deepseek-graphql-worker

# 初始化项目
npm init -y

# 创建目录结构
mkdir src
```

### 📝 步骤 4: 创建项目文件

需要创建以下文件：

| 文件 | 描述 |
|------|------|
| `src/index.js` | 🔧 主要的 Worker 代码 |
| `wrangler.toml` | ⚙️ 配置文件 |
| `package.json` | 📦 依赖管理 |

**📦 package.json 配置:**

```json
{
  "name": "deepseek-graphql-worker",
  "version": "1.0.0",
  "description": "DeepSeek API GraphQL Worker",
  "main": "src/index.js",
  "scripts": {
    "deploy": "wrangler deploy",
    "dev": "wrangler dev",
    "tail": "wrangler tail"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240620.0"
  }
}
```

### 🔑 步骤 5: 设置环境变量

```bash
# 设置 DeepSeek API Key
wrangler secret put DEEPSEEK_API_KEY
```

> 💡 **提示**: 创建 `.env` 文件并将 `DEEPSEEK_API_KEY` 替换为你的实际 API Key

### 🧪 步骤 6: 本地测试

```bash
# 启动开发服务器
npm run dev
# 或者
wrangler dev
```

📱 **测试访问**: [http://localhost:8787](http://localhost:8787)

### 🚀 步骤 7: 部署到 Cloudflare

```bash
# 部署到 Cloudflare
npm run deploy
# 或者
wrangler deploy
```

✅ **部署成功后**，你会获得一个类似这样的 URL：xxx

```
