# AI 对话界面

一个基于 React + TypeScript 的现代化 AI 对话框界面，采用 Tailwind CSS 设计，提供流畅的用户体验。

## ✨ 特性

- 🎨 **现代化设计** - 简洁美观的界面设计，支持深色模式
- 💬 **实时对话** - 模拟真实的 AI 对话体验
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 🚀 **TypeScript** - 完整的类型支持，提供更好的开发体验
- ⚡ **高性能** - 优化的渲染性能和流畅的动画效果
- 🎯 **易于扩展** - 模块化组件设计，便于定制和扩展

## 🖼️ 界面预览

- 清晰的消息气泡设计
- 用户和 AI 消息的视觉区分
- 实时打字指示器
- 消息时间戳显示
- 一键复制消息功能
- 清空对话历史功能

## 🛠️ 技术栈

- **前端框架**: React 18
- **类型系统**: TypeScript
- **样式框架**: Tailwind CSS
- **图标库**: Lucide React
- **构建工具**: Create React App

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/xiehaitao0229/ai-chat-interface.git

# 进入项目目录
cd ai-chat-interface

# 安装依赖
npm install
# 或者使用 yarn
yarn install
```

### 启动开发服务器

```bash
npm start
# 或者
yarn start
```

打开 [http://localhost:3000](http://localhost:3000) 在浏览器中查看应用。

### 构建生产版本

```bash
npm run build
# 或者
yarn build
```

## 📁 项目结构

```
ai-chat-interface/
├── public/                 # 静态文件
│   ├── index.html         # HTML 模板
│   └── manifest.json      # PWA 配置
├── src/                   # 源代码
│   ├── components/        # React 组件
│   │   └── AIChatInterface.tsx  # 主要聊天组件
│   ├── App.tsx           # 根组件
│   ├── App.css           # 应用样式
│   ├── index.tsx         # 应用入口
│   └── index.css         # 全局样式
├── tailwind.config.js    # Tailwind 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目配置
```

## 🎯 主要功能

### 消息管理
- 发送和接收消息
- 消息历史记录
- 清空对话功能
- 消息时间戳

### 用户体验
- 实时打字指示器
- 自动滚动到最新消息
- 键盘快捷键支持（Enter 发送，Shift+Enter 换行）
- 消息复制功能

### 界面特性
- 响应式设计
- 平滑动画效果
- 用户和 AI 消息的视觉区分
- 现代化的 UI 设计

## 🔧 自定义配置

### 修改 AI 响应逻辑   1

在 `src/components/AIChatInterface.tsx` 中的 `simulateAIResponse` 函数中修改 AI 的回复逻辑：

```typescript
const simulateAIResponse = async (userMessage: string): Promise<string> => {
  // 在这里添加你的 AI API 调用逻辑
  // 或者自定义回复规则
};
```

### 样式定制

在 `tailwind.config.js` 中修改主题配置：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // 自定义颜色
      },
      // 其他自定义配置
    },
  },
};
```

## 🤝 贡献指南

1. Fork 这个项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

这个项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙋‍♂️ 支持

如果你喜欢这个项目，请给它一个 ⭐️！

如果你有任何问题或建议，请创建一个 [Issue](https://github.com/xiehaitao0229/ai-chat-interface/issues)。

## 🚧 未来计划

- [ ] 集成真实的 AI API（如 OpenAI GPT、Claude 等）
- [ ] 添加消息搜索功能
- [ ] 支持文件上传和图片消息
- [ ] 添加消息导出功能
- [ ] 支持多语言
- [ ] 添加主题切换功能
- [ ] 实现消息的持久化存储
- [ ] 添加语音输入支持

