import axios from "axios";

const apiHost = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
const api = axios.create({
  baseURL: `${apiHost}/api`,
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// --- helpers ---
const isAuthRoute = (url?: string) => {
  if (!url) return false;
  const u = /^https?:\/\//i.test(url) ? new URL(url).pathname : url;
  return [
    "/v1/auth/login",
    "/v1/auth/register",
    "/v1/auth/verify-otp",
    "/v1/auth/verify-login-otp",
    "/v1/auth/refresh-access-token",
    "/v1/auth/google-login", // old one-tap path if used
    "/v1/auth/user",         // do NOT try refresh on this probe
  ].some((p) => u.includes(p));
};

const isAuthPage = () => {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return p === "/login" || p === "/signup" || p === "/callback";
};

const hasRefreshToken = () =>
  typeof window !== "undefined" && !!localStorage.getItem("refresh-token");

// --- request: attach bearer from localStorage + cache-bust GETs ---
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
      const method = String(config.method || "").toLowerCase();
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

// --- response: refresh-once policy, only if we actually have a refresh token ---
let isRefreshing = false;
type QueueItem = { resolve: (t: string | null) => void; reject: (e: any) => void };
let failedQueue: QueueItem[] = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (err: any) => {
    const error = err;
    const originalRequest: any = error?.config;

    if (error?.response?.status === 401 && originalRequest) {
      const url = originalRequest.url || "";

      // Never refresh for auth endpoints or the refresh endpoint itself
      if (isAuthRoute(url)) return Promise.reject(error);
      if (url.includes("/v1/auth/refresh-access-token")) return Promise.reject(error);

      // Only attempt refresh if app uses refresh tokens
      if (!hasRefreshToken()) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-user");
          localStorage.removeItem("auth-token");
          localStorage.removeItem("refresh-token");
          if (!isAuthPage()) window.location.replace("/login");
        }
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
            processQueue(null, "refreshed");
            return api(originalRequest);
          }
          // fallthrough to catch on non-200
          throw new Error("Refresh failed");
        } catch (refreshError) {
          processQueue(refreshError, null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-user");
            localStorage.removeItem("auth-token");
            localStorage.removeItem("refresh-token");
            if (!isAuthPage()) window.location.replace("/login");
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
