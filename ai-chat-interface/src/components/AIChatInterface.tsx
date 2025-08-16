import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Copy, RefreshCw, Settings, AlertCircle, Check, Volume2, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 代码块组件
const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden my-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-gray-300 text-sm border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 font-mono text-xs text-gray-400">{language || 'code'}</span>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors text-xs"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? '已复制' : '复制代码'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-gray-100 font-mono">
          {code}
        </code>
      </pre>
    </div>
  );
};

// 内联代码组件
const InlineCode: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-sm font-mono border border-blue-200">
    {children}
  </code>
);

// Markdown渲染组件
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderContent = (text: string) => {
    const elements: React.ReactNode[] = [];
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 代码块检测
      if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        elements.push(
          <CodeBlock key={i} code={codeLines.join('\n')} language={language} />
        );
        i++;
        continue;
      }

      // 标题检测
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 1;
        const title = line.replace(/^#+\s*/, '');
        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        const headingClass = {
          1: 'text-2xl font-bold mt-8 mb-4 text-gray-900 border-b-2 border-blue-100 pb-2',
          2: 'text-xl font-bold mt-6 mb-3 text-gray-900',
          3: 'text-lg font-semibold mt-5 mb-3 text-gray-800',
          4: 'text-base text-left font-semibold mt-4 mb-2 text-gray-800 ',
          5: 'text-sm text-left font-semibold mt-3 mb-2 text-gray-700',
          6: 'text-sm text-left font-medium mt-2 mb-1 text-gray-700'
        }[level] || 'text-base text-left font-medium mt-2 mb-1 text-gray-700';

        elements.push(
          <HeadingTag key={i} className={headingClass}>
            {renderInlineElements(title)}
          </HeadingTag>
        );
        i++;
        continue;
      }

      // 列表检测
      if (line.match(/^[\s]*[-*+]\s+/) || line.match(/^[\s]*\d+\.\s+/)) {
        const listItems: string[] = [];
        const isOrdered = line.match(/^[\s]*\d+\.\s+/);
        
        while (i < lines.length && (lines[i].match(/^[\s]*[-*+]\s+/) || lines[i].match(/^[\s]*\d+\.\s+/) || lines[i].trim() === '')) {
          if (lines[i].trim() !== '') {
            listItems.push(lines[i].replace(/^[\s]*(?:[-*+]|\d+\.)\s+/, ''));
          }
          i++;
        }
        i--; // 回退一步，因为外层循环会递增
        
        const ListTag = isOrdered ? 'ol' : 'ul';
        const listClass = isOrdered ? 'list-decimal list-inside my-4 space-y-2 pl-4' : 'list-disc list-inside my-4 space-y-2 pl-4';
        
        elements.push(
          <ListTag key={i} className={listClass}>
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-700 leading-relaxed text-base">
                <span className="ml-2">{renderInlineElements(item)}</span>
              </li>
            ))}
          </ListTag>
        );
        i++;
        continue;
      }

      // 引用检测
      if (line.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) {
          if (lines[i].trim() !== '') {
            quoteLines.push(lines[i].replace(/^>\s*/, ''));
          }
          i++;
        }
        i--; // 回退一步
        
        elements.push(
          <blockquote key={i} className="border-l-4 border-blue-400 pl-6 my-6 italic text-gray-600 bg-blue-50 py-4 rounded-r-lg">
            {quoteLines.map((quoteLine, idx) => (
              <p key={idx} className="text-base leading-relaxed">{renderInlineElements(quoteLine)}</p>
            ))}
          </blockquote>
        );
        i++;
        continue;
      }

      // 表格检测
      if (line.includes('|') && lines[i + 1]?.includes('---')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].includes('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        i--; // 回退一步
        
        if (tableLines.length > 2) {
          const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h);
          const rows = tableLines.slice(2).map(row => 
            row.split('|').map(cell => cell.trim()).filter(cell => cell)
          );
          
          elements.push(
            <div key={i} className="my-6 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header, idx) => (
                      <th key={idx} className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        {renderInlineElements(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-6 py-4 text-sm text-gray-700">
                          {renderInlineElements(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        i++;
        continue;
      }

      // 分隔线检测
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(
          <hr key={i} className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        );
        i++;
        continue;
      }

      // 普通段落
      if (line.trim()) {
        elements.push(
          <p key={i} className="mb-4 text-gray-700 leading-relaxed text-base text-left">
            {renderInlineElements(line)}
          </p>
        );
      } else {
        elements.push(<div key={i} className="h-2" />);
      }
      
      i++;
    }

    return elements;
  };

  // 渲染内联元素（粗体、斜体、内联代码、链接等）
  const renderInlineElements = (text: string): React.ReactNode => {
    if (!text) return text;

    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining) {
      // 内联代码
      const codeMatch = remaining.match(/`([^`]+)`/);
      if (codeMatch) {
        const before = remaining.slice(0, codeMatch.index);
        if (before) parts.push(before);
        parts.push(<InlineCode key={key++}>{codeMatch[1]}</InlineCode>);
        remaining = remaining.slice(codeMatch.index! + codeMatch[0].length);
        continue;
      }

      // 粗体
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      if (boldMatch) {
        const before = remaining.slice(0, boldMatch.index);
        if (before) parts.push(before);
        parts.push(<strong key={key++} className="font-semibold text-gray-900">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch.index! + boldMatch[0].length);
        continue;
      }

      // 斜体
      const italicMatch = remaining.match(/\*([^*]+)\*/);
      if (italicMatch) {
        const before = remaining.slice(0, italicMatch.index);
        if (before) parts.push(before);
        parts.push(<em key={key++} className="italic text-gray-800">{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch.index! + italicMatch[0].length);
        continue;
      }

      // 链接
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const before = remaining.slice(0, linkMatch.index);
        if (before) parts.push(before);
        parts.push(
          <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all">
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch.index! + linkMatch[0].length);
        continue;
      }

      // 没有更多特殊格式，添加剩余文本
      parts.push(remaining);
      break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  return <div className="prose max-w-none text-base leading-relaxed">{renderContent(content)}</div>;
};

// GraphQL 响应类型
interface GraphQLResponse {
  data?: {
    chat?: {
      id: string;
      model: string;
      choices: Array<{
        message: {
          role: string;
          content: string;
        };
        finishReason: string;
        index: number;
      }>;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
      created: number;
    };
    models?: Array<{
      id: string;
      object: string;
      created: number;
      ownedBy: string;
    }>;
  };
  errors?: Array<{
    message: string;
    details?: string;
  }>;
}

// GraphQL 查询模板
const CHAT_QUERY = `
  query ChatCompletion($messages: [MessageInput!]!, $model: String, $maxTokens: Int, $temperature: Float) {
    chat(messages: $messages, model: $model, maxTokens: $maxTokens, temperature: $temperature) {
      id
      model
      choices {
        message {
          role
          content
        }
        finishReason
        index
      }
      usage {
        promptTokens
        completionTokens
        totalTokens
      }
      created
    }
  }
`;

const MODELS_QUERY = `
  query GetModels {
    models {
      id
      object
      created
      ownedBy
    }
  }
`;

const AIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好！我是 **DeepSeek AI** 助手，有什么可以帮助你的吗？\n\n我支持：\n- 📝 **Markdown 格式化** - 包括标题、列表、表格等\n- 💻 **代码高亮** - 支持多种编程语言\n- 🔗 **链接解析** - 自动识别和渲染链接\n- 📊 **表格渲染** - 美观的表格显示\n- 🎨 **丰富样式** - 引用块、分隔线等\n\n试试问我一些问题，或者让我写一段代码吧！',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  // DeepSeek 配置
  const [workerUrl, setWorkerUrl] = useState('https://deepseek-graphql-worker.xiehaitao229.workers.dev');
  const [model, setModel] = useState('deepseek-chat');
  const [maxTokens, setMaxTokens] = useState(1000);
  const [temperature, setTemperature] = useState(0.7);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 从 localStorage 恢复配置
  useEffect(() => {
    const savedUrl = localStorage.getItem('deepseek_worker_url');
    const savedModel = localStorage.getItem('deepseek_model');
    const savedMaxTokens = localStorage.getItem('deepseek_max_tokens');
    const savedTemperature = localStorage.getItem('deepseek_temperature');

    if (savedUrl) setWorkerUrl(savedUrl);
    if (savedModel) setModel(savedModel);
    if (savedMaxTokens) setMaxTokens(parseInt(savedMaxTokens));
    if (savedTemperature) setTemperature(parseFloat(savedTemperature));
  }, []);

  // 获取可用模型列表
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: MODELS_QUERY,
          variables: {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: GraphQLResponse = await response.json();

      if (result.errors) {
        console.warn('获取模型列表失败:', result.errors);
        return;
      }

      if (result.data?.models) {
        const modelIds = result.data.models.map(m => m.id);
        setAvailableModels(modelIds);
        console.log('可用模型:', modelIds);
      }
    } catch (error) {
      console.warn('获取模型列表失败:', error);
      setAvailableModels(['deepseek-chat', 'deepseek-coder']);
    }
  }, [workerUrl]);

  // 初始化时获取模型列表
  useEffect(() => {
    if (workerUrl) {
      fetchModels();
    }
  }, [workerUrl, fetchModels]);

  // 保存配置到 localStorage
  const saveSettings = () => {
    localStorage.setItem('deepseek_worker_url', workerUrl);
    localStorage.setItem('deepseek_model', model);
    localStorage.setItem('deepseek_max_tokens', maxTokens.toString());
    localStorage.setItem('deepseek_temperature', temperature.toString());
    setShowSettings(false);
    
    if (workerUrl) {
      fetchModels();
    }
  };

  // 调用 DeepSeek API (GraphQL)
  const callDeepSeekGraphQL = async (conversationMessages: Array<{role: string, content: string}>): Promise<{content: string, usage?: any}> => {
    try {
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: CHAT_QUERY,
          variables: {
            messages: conversationMessages,
            model: model,
            maxTokens: maxTokens,
            temperature: temperature
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: GraphQLResponse = await response.json();

      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors.map(e => e.message).join(', ');
        throw new Error(`GraphQL 错误: ${errorMessage}`);
      }

      if (!result.data?.chat) {
        throw new Error('GraphQL 响应中缺少 chat 数据');
      }

      const chatData = result.data.chat;
      
      console.log('DeepSeek API Usage:', {
        model: chatData.model,
        usage: chatData.usage,
        created: new Date(chatData.created * 1000)
      });

      if (chatData.choices && chatData.choices.length > 0) {
        return {
          content: chatData.choices[0].message.content,
          usage: chatData.usage
        };
      } else {
        throw new Error('API 响应中没有生成的内容');
      }

    } catch (error) {
      console.error('DeepSeek GraphQL Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('网络连接失败，请检查 Worker URL 是否正确');
        } else if (error.message.includes('CORS')) {
          throw new Error('跨域请求被阻止，请检查 Worker 的 CORS 配置');
        } else if (error.message.includes('GraphQL')) {
          throw error;
        } else {
          throw new Error(`API 调用失败: ${error.message}`);
        }
      }
      
      throw new Error('未知网络错误');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!workerUrl.trim()) {
      alert('请先配置 Worker URL');
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const maxHistoryLength = 10;
      const trimmedMessages = conversationMessages.slice(-maxHistoryLength);

      const response = await callDeepSeekGraphQL(trimmedMessages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        usage: response.usage ? {
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens
        } : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ **错误**: ${error instanceof Error ? error.message : '未知错误'}`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      content: '你好！我是 **DeepSeek AI** 助手，有什么可以帮助你的吗？\n\n我支持：\n- 📝 **Markdown 格式化** - 包括标题、列表、表格等\n- 💻 **代码高亮** - 支持多种编程语言\n- 🔗 **链接解析** - 自动识别和渲染链接\n- 📊 **表格渲染** - 美观的表格显示\n- 🎨 **丰富样式** - 引用块、分隔线等\n\n试试问我一些问题，或者让我写一段代码吧！',
      role: 'assistant',
      timestamp: new Date()
    }]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-8 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DeepSeek AI Chat</h1>
              <p className="text-sm text-gray-600 flex items-center space-x-3">
                <span>模型: <span className="font-semibold text-blue-600">{model}</span></span>
                <span className="text-gray-400">•</span>
                <span className={`flex items-center space-x-1 ${workerUrl ? 'text-green-600' : 'text-red-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${workerUrl ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{workerUrl ? '已连接' : '未配置'}</span>
                </span>
                {availableModels.length > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{availableModels.length} 个可用模型</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-200 border border-gray-200/50 hover:border-gray-300 hover:shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium">设置</span>
            </button>
            <button
              onClick={clearChat}
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-200 border border-gray-200/50 hover:border-gray-300 hover:shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">清空</span>
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-6 p-8 bg-white/95 backdrop-blur rounded-2xl border border-gray-200/50 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">配置设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  GraphQL Worker URL
                </label>
                <input
                  type="text"
                  value={workerUrl}
                  onChange={(e) => setWorkerUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://deepseek-graphql-worker.workers.dev"
                />
                <p className="text-xs text-gray-500 mt-2">
                  支持 GraphQL 查询的 Cloudflare Worker URL
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  模型选择 {availableModels.length > 0 && <span className="text-green-600 font-normal">({availableModels.length} 个可用)</span>}
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {availableModels.length > 0 ? (
                    availableModels.map(modelId => (
                      <option key={modelId} value={modelId}>{modelId}</option>
                    ))
                  ) : (
                    <>
                      <option value="deepseek-chat">DeepSeek Chat</option>
                      <option value="deepseek-coder">DeepSeek Coder</option>
                    </>
                  )}
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  最大 Tokens: <span className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">{maxTokens}</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="4000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  创造性: <span className="text-purple-600 font-mono bg-purple-50 px-2 py-0.5 rounded">{temperature}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={fetchModels}
                disabled={!workerUrl}
                className="px-5 py-2.5 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 transition-colors shadow-sm"
              >
                刷新模型列表
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2.5 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={saveSettings}
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm font-medium"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {!workerUrl && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 mx-8 mt-6 rounded-r-xl shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm text-yellow-800 font-medium">
                请先在设置中配置 GraphQL Worker URL 才能开始对话
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-6 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600'
                  : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-6 h-6 text-white" />
              ) : (
                <Bot className="w-6 h-6 text-white" />
              )}
            </div>

            {/* Message Container */}
            <div
              className={`group flex-1 ${
                message.role === 'user' ? 'flex flex-col items-end' : ''
              }`}
            >
              {/* Message Content */}
              <div
                className={`relative max-w-4xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-3xl rounded-br-xl px-6 py-4 shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-800 rounded-3xl rounded-bl-xl px-8 py-6 shadow-sm'
                }`}
              >
                {/* Message Text */}
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}

                {/* Action Buttons */}
                <div
                  className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 ${
                    message.role === 'user' ? 'text-white/80' : 'text-gray-400'
                  }`}
                >
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className={`p-2 rounded-lg hover:bg-black/10 transition-colors ${
                      message.role === 'user' ? 'hover:bg-white/20' : 'hover:bg-gray-100'
                    }`}
                    title="复制消息"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {message.role === 'assistant' && (
                    <>
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="朗读"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="好评"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="差评"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Message Meta Info */}
              <div
                className={`flex items-center mt-3 px-4 text-xs text-gray-500 space-x-4 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span>{formatTime(message.timestamp)}</span>
                </span>
                {message.usage && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                      <span>💬 {message.usage.totalTokens} tokens</span>
                      <span className="text-gray-400">|</span>
                      <span>📥 {message.usage.promptTokens}</span>
                      <span className="text-gray-400">|</span>
                      <span>📤 {message.usage.completionTokens}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl rounded-bl-xl px-8 py-6 shadow-sm max-w-xs">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-600 text-sm font-medium">AI 正在思考...</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">通过 GraphQL 查询中</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white/90 backdrop-blur-md border-t border-gray-200/50 px-8 py-6">
        <div className="flex items-end space-x-4 max-w-5xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的消息... 支持 Markdown 格式"
              disabled={!workerUrl}
              className="w-full resize-none border-2 border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-40 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-base leading-relaxed"
              rows={1}
              style={{
                minHeight: '56px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 160) + 'px';
              }}
            />
            {/* Character count */}
            <div className="absolute bottom-2 right-4 text-xs text-gray-400">
              {input.length} 字符
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || !workerUrl}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-200 flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-sm"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500 max-w-5xl mx-auto">
          <p>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> 发送消息
            <span className="mx-2">•</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> 换行
          </p>
          <p className="flex items-center space-x-2">
            <span>由 DeepSeek AI 驱动</span>
            {workerUrl && (
              <>
                <span>•</span>
                <span className="text-green-600">GraphQL 已连接</span>
              </>
            )}
          </p>
        </div>
      </div>

  
    </div>
  );
};

export default AIChatInterface;