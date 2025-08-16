// Cloudflare Worker - DeepSeek API with GraphQL
export default {
    async fetch(request, env, ctx) {
      // 处理 CORS 预检请求
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }
  
      // 只允许 POST 请求
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { 
          status: 405,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
  
      try {
        // 解析请求体
        const { query, variables, operationName } = await request.json();
  
        if (!query) {
          return new Response(
            JSON.stringify({ 
              errors: [{ message: 'GraphQL query is required' }] 
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              }
            }
          );
        }
  
        // 解析 GraphQL 查询，提取 DeepSeek API 调用信息
        const result = await handleGraphQLQuery(query, variables, env);
  
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
  
      } catch (error) {
        console.error('Error processing request:', error);
        return new Response(
          JSON.stringify({ 
            errors: [{ message: 'Internal server error', details: error.message }] 
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }
    }
  };
  
  // GraphQL Schema 解析和处理
  async function handleGraphQLQuery(query, variables, env) {
    // 简单的 GraphQL 查询解析（实际项目中可以使用 graphql-js 库）
    const queryType = extractQueryType(query);
    
    switch (queryType) {
      case 'chat':
        return await handleChatQuery(query, variables, env);
      case 'models':
        return await handleModelsQuery(env);
      default:
        return {
          errors: [{ message: `Unknown query type: ${queryType}` }]
        };
    }
  }
  
  // 处理聊天查询
  async function handleChatQuery(query, variables, env) {
    try {
      // 从 variables 或查询中提取参数
      const messages = variables?.messages || [];
      const model = variables?.model || 'deepseek-chat';
      const maxTokens = variables?.maxTokens || 1024;
      const temperature = variables?.temperature || 0.7;
  
      if (!messages || messages.length === 0) {
        return {
          errors: [{ message: 'Messages are required for chat query' }]
        };
      }
  
      // 调用 DeepSeek API
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: maxTokens,
          temperature: temperature,
          stream: false,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData}`);
      }
  
      const data = await response.json();
  
      // 返回 GraphQL 格式的响应
      return {
        data: {
          chat: {
            id: data.id,
            model: data.model,
            choices: data.choices.map(choice => ({
              message: {
                role: choice.message.role,
                content: choice.message.content,
              },
              finishReason: choice.finish_reason,
              index: choice.index,
            })),
            usage: {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            },
            created: data.created,
          }
        }
      };
  
    } catch (error) {
      return {
        errors: [{ 
          message: 'Failed to call DeepSeek API', 
          details: error.message 
        }]
      };
    }
  }
  
  // 处理模型列表查询
  async function handleModelsQuery(env) {
    try {
      const response = await fetch('https://api.deepseek.com/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }
  
      const data = await response.json();
  
      return {
        data: {
          models: data.data.map(model => ({
            id: model.id,
            object: model.object,
            created: model.created,
            ownedBy: model.owned_by,
          }))
        }
      };
  
    } catch (error) {
      return {
        errors: [{ 
          message: 'Failed to fetch models', 
          details: error.message 
        }]
      };
    }
  }
  
  // 简单的查询类型提取函数
  function extractQueryType(query) {
    const cleanQuery = query.replace(/\s+/g, ' ').trim().toLowerCase();
    
    if (cleanQuery.includes('chat') || cleanQuery.includes('completion')) {
      return 'chat';
    } else if (cleanQuery.includes('models')) {
      return 'models';
    }
    
    return 'unknown';
  }