import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const createLink = (data) => api.post('/links', data);
export const getLinks = (page = 1, limit = 10) => api.get(`/links?page=${page}&limit=${limit}`);
export const getLinkStats = (id) => api.get(`/links/${id}/stats`);
export const deleteLink = (id) => api.delete(`/links/${id}`);

export default api;
