import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
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
