import axios from 'axios';

console.log(import.meta.env.VITE_API_URL, 'vite api url');

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const fetchDevices = async () => {
  const response = await apiClient.get('/devices');
  return response.data.data;
};

export const fetchHistory = async () => {
  const response = await apiClient.get('/devices/history');
  return response.data.data;
};

export const resetDemo = async () => {
  const response = await apiClient.post('/devices/reset');
  return response.data;
};
