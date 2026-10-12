import axios from "axios";

/**
 * Central Axios instance for all Patient Flow API calls.
 * Base URL is driven by the VITE_API_BASE_URL environment variable.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
