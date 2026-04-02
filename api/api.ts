import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const retrySet = new Set<any>();

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

if (typeof window !== "undefined") {
  api.interceptors.request.use(
    (config) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status !== 401 || retrySet.has(originalRequest)) {
        return Promise.reject(error);
      }

      retrySet.add(originalRequest);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      const fromLocal = localStorage.getItem("refreshToken");
      const fromSession = sessionStorage.getItem("refreshToken");
      const refreshToken = fromLocal || fromSession;

      if (!refreshToken) {
        isRefreshing = false;
        // window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      return new Promise(async (resolve, reject) => {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}users/auth/refresh`,
            { refresh_token: refreshToken },
          );

          const newAccessToken = res.data.data.access_token;
          const newRefreshToken = res.data.data.refresh_token;

          const storage = fromLocal ? localStorage : sessionStorage;
          storage.setItem("accessToken", newAccessToken);
          storage.setItem("refreshToken", newRefreshToken);

          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api(originalRequest));
        } catch (refreshError) {
          processQueue(refreshError, null);

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");

          // window.location.href = "/auth/login";

          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    },
  );
}

export default api;
