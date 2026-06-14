import api from './api';

export const getAnalytics = async (shortCode) => {
  const response = await api.get(`/analytics/${shortCode}`);
  return response.data;
};