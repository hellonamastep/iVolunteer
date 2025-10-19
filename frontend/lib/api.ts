

import axios from "axios";

const apiHost = (process.env.NEXT_PUBLIC_API_URL || "https://namastep-irod.onrender.com").replace(/\/$/, "");
const api = axios.create({
  baseURL: `${apiHost}/api`, // frontend "/v1/*" -> backend "/api/v1/*"
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// Helpers
const isAuthRoute = (url?: string) => {
  if (!url) return false;
  // normalize to path only
  const u = /^https?:\/\//i.test(url) ? new URL(url).pathname : url;
  return [
    "/v1/auth/login",
    "/v1/auth/verify-otp",
    "/v1/auth/register",
    "/v1/auth/refresh-access-token",
    "/v1/auth/verify-login-otp", // if you use this path
  ].some((p) => u.includes(p));
};

const unwrap = (r: any) => r?.data?.data ?? r?.data ?? r;

// Refresh state
let isRefreshing = false;
type QueueItem = { resolve: (token: string | null) => void; reject: (err: any) => void };
let failedQueue: QueueItem[] = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
};

// REQUEST: attach token and add cache-buster for GET
api.interceptors.request.use(
  (config: any) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
      if (token) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        };
      }

      const method = (config.method || "").toString().toLowerCase();
      if (method === "get" && config.url) {
        try {
          const full = new URL(config.url, config.baseURL);
          full.searchParams.set("_t", Date.now().toString());
          config.url = /^https?:\/\//i.test(config.url) ? full.toString() : full.pathname + full.search;
        } catch {
          const sep = config.url.includes("?") ? "&" : "?";
          config.url = `${config.url}${sep}_t=${Date.now()}`;
        }
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE: refresh on 401, but NEVER for auth endpoints
api.interceptors.response.use(
  (response) => response,
  async (err: any) => {
    const error = err;
    const originalRequest: any = error.config;

    // If 401 on auth endpoints, do not refresh. Just fail.
    if (error.response?.status === 401 && originalRequest) {
      const url = originalRequest.url || "";
      if (isAuthRoute(url)) {
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => api(originalRequest))
            .catch((e) => Promise.reject(e));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshUrl = `${apiHost}/api/v1/auth/refresh-access-token`;
          const refreshResponse = await axios.post(refreshUrl, {}, { withCredentials: true });

          if (refreshResponse.status === 200) {
            // optionally update stored tokens here if backend returns them
            processQueue(null, "refreshed");
            // retry original request with the same axios instance (which will pick updated token if set)
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Clear auth storage and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-user");
            localStorage.removeItem("auth-token");
            localStorage.removeItem("refresh-token");
            window.dispatchEvent(new CustomEvent("token-expired"));
            window.location.href = "/auth";
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;