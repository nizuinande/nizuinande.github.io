import axios from 'axios';


const api = axios.create({
  baseURL: 'https://api.deepseek.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
  },
  // timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(config => {
  // config.headers.Authorization = `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`;
  // config.headers['Content-Type'] = 'application/json';
  return config;
}, error => {
  return Promise.reject(error);
});

export const chatCompletion = async ({ character, message }) => {
  try {
    console.log(character);

    const response = await api.post('/chat/completions', {
      model: 'deepseek-reasoner',
      messages: [{
        role: 'system',
        content: `你正在扮演${character.name}，人物背景为${character.background}，性格特点为${character.personalityTraits},特殊技能是${character.specialSkills.join(',')}。请保持角色设定进行对话`
      }, {
        role: 'user',
        content: message
      }]
    });

    return {
      data: response.data.choices[0].message.content,
      status: response.status
    };
  } catch (error) {
    if (error.response) {
      console.error('API响应错误:', error.response.data);
      return { error: '服务暂时不可用，请稍后再试' };
    } else if (error.request) {
      console.error('请求未响应:', error.request);
      return { error: '网络连接异常，请检查网络' };
    } else {
      console.error('请求配置错误:', error.message);
      return { error: '客户端请求异常' };
    }
  }
};