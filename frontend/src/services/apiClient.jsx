import axios from 'axios';

// Yeh line bahut important hai
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

console.log("API Client Initializing. VITE_API_BASE_URL from env:", import.meta.env.VITE_API_BASE_URL); // DEBUG

const apiClient = axios.create({
  // Agar VITE_API_BASE_URL undefined hai toh fallback use hoga
  baseURL: API_BASE_URL || 'http://localhost:3000', 
  withCredentials: true,
});

// DEBUG: Print the actual baseURL being used by the instance
console.log("apiClient configured with baseURL:", apiClient.defaults.baseURL); 

export default apiClient;