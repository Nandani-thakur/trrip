import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Auto attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// Upload
export const uploadDocument = (formData, onProgress) =>
  API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });

// Itineraries
export const getItineraries = (page = 1) => API.get(`/itineraries?page=${page}&limit=10`);
export const getItinerary = (id) => API.get(`/itineraries/${id}`);
export const toggleShare = (id) => API.patch(`/itineraries/${id}/share`);
export const deleteItinerary = (id) => API.delete(`/itineraries/${id}`);
export const getSharedItinerary = (token) => API.get(`/itineraries/share/${token}`);