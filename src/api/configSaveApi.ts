import axios from 'axios';
import { notification } from 'ant-design-vue';
import { h } from 'vue';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  timeout: 10000,
});

function alertError(status: number, msg: string) {
  const map: Record<number, { en: string; zh: string }> = {
    400: { en: 'Bad Request', zh: '可能是请求参数格式错误或缺少必填字段，正在为您重试。' },
    401: { en: 'Unauthorized', zh: '可能是登录已过期，请重新登录，正在为您重试。' },
    403: { en: 'Forbidden', zh: '可能是权限不足，请联系管理员，正在为您重试。' },
    404: { en: 'Not Found', zh: '可能是接口地址错误或资源已被删除，正在为您重试。' },
    500: { en: 'Internal Server Error', zh: '可能是服务器内部异常，正在为您重试。' },
    502: { en: 'Bad Gateway', zh: '可能是网关异常，正在为您重试。' },
    503: { en: 'Service Unavailable', zh: '可能是服务正在维护，正在为您重试。' },
  };

  const codeText = map[status] || { en: `HTTP ${status}`, zh: '未知网络错误或服务异常，请联系管理员。' };

  notification.error({
    message: `请求失败 (${status} ${codeText.en})`,
    description: h('div', { style: 'white-space: pre-wrap;' }, [
      `服务器异常返回了：${msg}`,
      h('br'),
      codeText.zh,
    ]),
    placement: 'bottomRight',
  });
}

export async function saveConfig(cfg: any, selected: string[]) {
  try {
    const { data } = await http.post('/save', { cfg, selected });
    return data;
  } catch (err: any) {
    const status = err?.response?.status || 0;
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.response?.statusText ||
      '未知错误';
    alertError(status, msg);
    throw err;
  }
}

export async function startService(cfg: any, selected: string[]) {
  try {
    const { data } = await http.post('/start', { cfg, selected });
    return data;
  } catch (err: any) {
    const status = err?.response?.status || 0;
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.response?.statusText ||
      '未知错误';
    alertError(status, msg);
    throw err;
  }
}