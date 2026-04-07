import axios from "axios";
import type {
  Application,
  ParsedJobData,
} from "../types/index";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ token: string; user: { id: string; name: string; email: string } }>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: { id: string; name: string; email: string } }>("/auth/login", data),
  getMe: () =>
    api.get<{ user: { id: string; name: string; email: string } }>("/auth/me"),
};

// Applications
export const applicationsApi = {
  getAll: () => api.get<{ applications: Application[] }>("/applications"),
  create: (data: Partial<Application>) =>
    api.post<{ application: Application }>("/applications", data),
  update: (id: string, data: Partial<Application>) =>
    api.put<{ application: Application }>(`/applications/${id}`, data),
  delete: (id: string) => api.delete(`/applications/${id}`),
  updateOrder: (updates: Array<{ id: string; status: string; order: number }>) =>
    api.put("/applications/order", { updates }),
};

// AI
export const aiApi = {
  parseJD: (jobDescription: string) =>
    api.post<{ parsed: ParsedJobData }>("/ai/parse", { jobDescription }),
  getSuggestions: (jobDescription: string, parsedData: ParsedJobData) =>
    api.post<{ suggestions: { bullets: string[] } }>("/ai/suggestions", {
      jobDescription,
      parsedData,
    }),
};

export default api;
