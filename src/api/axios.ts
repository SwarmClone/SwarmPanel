import axios from 'axios';
import { notification } from 'ant-design-vue';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  timeout: 10000,
});

http.interceptors.response.use(
  response => response,
  error => {
    const backendMsg =
      error?.response?.data?.detail ||   // FastAPI 默认字段
      error?.response?.data?.message ||
      error?.response?.statusText ||
      error?.message ||
      '未知错误';

    notification.error({
      message: '请求失败',
      description: backendMsg,
      placement: 'bottomRight',
    });
    return Promise.reject(error);
  }
);

export default http;