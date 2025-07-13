import axios from 'axios';

export async function getLastestVersion(host: string = '127.0.0.1', port: string = '8000') {
  try {
    const response = await axios.get(`http://${host}:${port}/api/get_version`);
    return response.data.version;
  } catch (error) {
    console.error('无法向后端获取当前程序版本:', error);
    return 'error';
  }
}