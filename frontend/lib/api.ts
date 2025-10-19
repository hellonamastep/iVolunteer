// // src/lib/api.ts
// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "https://namastep-irod.onrender.com",
//   withCredentials: true, // if you're using cookies / auth
//   headers: {
//     'Cache-Control': 'no-cache',
//     'Pragma': 'no-cache',
//     'Expires': '0'
//   }
// });

// // Flag to prevent multiple refresh attempts
// let isRefreshing = false;
// let failedQueue: any[] = [];

// const processQueue = (error: any, token: string | null = null) => {
//   failedQueue.forEach(({ resolve, reject }) => {
//     if (error) {
//       reject(error);
//     } else {
//       resolve(token);
//     }
//   });
  
//   failedQueue = [];
// };

// // Add a request interceptor to add the auth token
// api.interceptors.request.use(
//   (config) => {
//     // Get token from localStorage
//     const token = localStorage.getItem('auth-token');
//     if (token) {
//       config.headers = {
//         ...config.headers,
//         Authorization: `Bearer ${token}`,
//         'Cache-Control': 'no-cache',
//         'Pragma': 'no-cache'
//       };
//     }
    
//     // Add timestamp parameter to prevent caching for GET requests
//     if (config.method === 'get') {
//       const separator = config.url?.includes('?') ? '&' : '?';
//       config.url = `${config.url}${separator}_t=${Date.now()}`;
//     }
    
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add a response interceptor to handle token expiration
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     // Check if the error is due to token expiration
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         // If already refreshing, queue this request
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(() => {
//           return api(originalRequest);
//         }).catch(err => {
//           return Promise.reject(err);
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         // Try to refresh the token
//         const refreshResponse = await axios.post(
//           `${(process.env.API_BASE_URL || "https://namastep-irod.onrender.com/api").replace('/api', '')}/api/v1/auth/refresh-access-token`,
//           {},
//           { withCredentials: true }
//         );

//         if (refreshResponse.status === 200) {
//           console.log('Token refreshed successfully');
//           processQueue(null, 'success');
          
//           // Retry the original request
//           return api(originalRequest);
//         }
//       } catch (refreshError) {
//         console.log('Token refresh failed, logging out user');
//         processQueue(refreshError, null);
        
//         // Clear all auth data
//         localStorage.removeItem('auth-user');
//         localStorage.removeItem('auth-token');
//         localStorage.removeItem('refresh-token');
        
//         // Redirect to auth page
//         if (typeof window !== 'undefined') {
//           // Trigger a custom event that the auth context can listen to
//           window.dispatchEvent(new CustomEvent('token-expired'));
          
//           // Redirect to login page
//           window.location.href = '/auth';
//         }
//       } finally {
//         isRefreshing = false;
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;


import axios, { AxiosError, AxiosRequestConfig } from "axios";

const apiHost = (process.env.NEXT_PUBLIC_API_URL || "https://namastep-irod.onrender.com/api").replace(/\/$/, '');
const api = axios.create({
  baseURL: apiHost, // NEXT_PUBLIC_API_URL includes /api (e.g., https://namastep-irod.onrender.com/api)
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
type QueueItem = {
  resolve: (token: string | null) => void;
  reject: (err: any) => void;
};
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add token if present
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

      // Add timestamp parameter to prevent caching for GET requests
      const method = (config.method || "").toString().toLowerCase();
      if (method === "get" && config.url) {
        try {
          // construct URL relative to baseURL so we handle both absolute and relative config.url
          const full = new URL(config.url, config.baseURL);
          full.searchParams.set("_t", Date.now().toString());

          // If original config.url was absolute, keep absolute; otherwise set relative path+search
          if (/^https?:\/\//i.test(config.url)) {
            config.url = full.toString();
          } else {
            config.url = full.pathname + full.search;
          }
        } catch {
          // fallback if URL parsing fails
          const separator = config.url.includes("?") ? "&" : "?";
          config.url = `${config.url}${separator}_t=${Date.now()}`;
        }
      }
    } catch (e) {
      // silent fail safe
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (err: AxiosError & { config?: any }) => {
    const error = err;
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } | undefined = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
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
        // call refresh endpoint on the same host
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
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
