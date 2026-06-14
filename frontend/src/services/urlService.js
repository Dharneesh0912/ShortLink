import api from './api';

export const getUrls = async () => {
  const response = await api.get('/urls');
  return response.data.urls;
};

export const shortenUrl = async (originalUrl, customAlias = null, expiresAt = null) => {
  const payload = { originalUrl };
  if (customAlias) payload.customAlias = customAlias;
  if (expiresAt)   payload.expiresAt   = expiresAt;
  const response = await api.post('/urls/shorten', payload);
  return response.data.url;
};

export const deleteUrl = async (id) => {
  const response = await api.delete(`/urls/${id}`);
  return response.data;
};

export const updateUrl = async (id, originalUrl) => {
  const response = await api.put(`/urls/${id}`, { originalUrl });
  return response.data.url;
};

export const checkAlias = async (alias) => {
  const response = await api.get(`/urls/check-alias/${alias}`);
  return response.data.available;
};

export const bulkUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/urls/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};