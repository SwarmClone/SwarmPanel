import http from './axios';

export const fetchVersion = () =>
  http.get('/api/get_version').then((res) => res.data);

export const fetchStartupParam = () =>
  http.get('/api/startup_param').then((res) => res.data);