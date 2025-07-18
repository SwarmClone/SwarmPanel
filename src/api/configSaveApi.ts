import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  timeout: 10000,
});

export async function saveConfig(cfg: any, selected: string[]) {
  return http.post('/save', { cfg, selected });
}

export async function startService(cfg: any, selected: string[]) {
  return http.post('/start', { cfg, selected });
}