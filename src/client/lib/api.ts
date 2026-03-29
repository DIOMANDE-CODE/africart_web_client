/**
 * Centralised Axios instance.
 * All API calls must go through this client so that
 * base-URL, credentials and headers are set once.
 */
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,           // required for HttpOnly cookie auth
  headers: { "Content-Type": "application/json" },
});

export default api;
