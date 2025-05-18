// frontend/src/services/apiClient.js
import axios from 'axios';

// VITE_API_BASE_URL tumhare .env.production (Vercel par) aur .env.local (local dev) se aayega
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
// ^^^ Ensure fallback 'http://localhost:3000' tumhare local backend ka sahi URL hai

console.log("API Client Base URL:", API_BASE_URL); // <<--- DEBUGGING LINE

const apiClient = axios.create({
  baseURL: API_BASE_URL, // baseURL yahan set hai
  withCredentials: true,
});

export default apiClient;