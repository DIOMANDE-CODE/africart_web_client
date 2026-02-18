import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // URL de ton backend Django DRF
  withCredentials: true, // indispensable pour envoyer/recevoir les cookies
  headers: {
    "Content-Type": "application/json",
  },
});


export default api;
