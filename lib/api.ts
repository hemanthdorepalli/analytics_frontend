import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const orgId = localStorage.getItem("org_id");
    if (orgId) config.headers["X-Organization-ID"] = orgId;

    // Fallback: use token from localStorage if cookies not working (cross-domain)
    const accessToken = localStorage.getItem("access_token");
    if (accessToken && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }
  return config;
});

let refreshing = false;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    const is401 = err.response?.status === 401;
    const isAuth = orig?.url?.includes("/auth/");
    if (is401 && !orig._retry && !isAuth && !refreshing) {
      orig._retry = true; refreshing = true;
      try {
        await api.post("/auth/token/refresh/");
        refreshing = false;
        return api(orig);
      } catch {
        refreshing = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem("org_id");
          localStorage.removeItem("role");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export function getErrorMessage(e: any): string {
  return e?.response?.data?.error?.message || e?.response?.data?.detail || e?.message || "Something went wrong";
}

export function loginWithGoogle() {
  window.location.href = `${BASE}/auth/login/google-oauth2/`;
}