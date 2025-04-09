// frontend/src/api.js
import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000";

// ← Add this:
console.log("🚀 API_BASE is:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;
