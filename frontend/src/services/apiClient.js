// frontend/src/services/apiClient.js
import axios from 'axios';

const VITE_ENV_VAR_VALUE = import.meta.env.VITE_API_BASE_URL;
const FALLBACK_URL = 'http://localhost:3000';

console.log("--- apiClient.js ---");
console.log("Value of import.meta.env.VITE_API_BASE_URL from build:", VITE_ENV_VAR_VALUE);

const effectiveBaseURL = VITE_ENV_VAR_VALUE || FALLBACK_URL;

const apiClient = axios.create({
  baseURL: effectiveBaseURL,
  withCredentials: true,
});

console.log("apiClient instance created. Final baseURL used by instance:", apiClient.defaults.baseURL);
console.log("--- End apiClient.js ---");

export default apiClient;