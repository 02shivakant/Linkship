import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

console.log("Mode:", import.meta.env.MODE);
console.log("VITE_API_URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const createLink = (data) => api.post("/api/links", data);

export const getLinks = (page = 1, limit = 10) =>
  api.get(`/api/links?page=${page}&limit=${limit}`);

export const getLinkStats = (id) =>
  api.get(`/api/links/${id}/stats`);

export const deleteLink = (id) =>
  api.delete(`/api/links/${id}`);

export default api;