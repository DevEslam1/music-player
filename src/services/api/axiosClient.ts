import axios from "axios";
import { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  notifyUnauthorized,
  saveAuthTokens,
} from "../auth/session";

export const BASE_DOMAIN = "https://musicapp-production-bcd8.up.railway.app";
export const API_PREFIX = "/api/";
export const BASE_URL = `${BASE_DOMAIN}${API_PREFIX}`;

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

let refreshPromise: Promise<string | null> | null = null;

const shouldSkipRefresh = (config?: InternalAxiosRequestConfig) => {
  const requestUrl = config?.url ?? "";
  return requestUrl.includes("auth/login/") || requestUrl.includes("auth/refresh/");
};

const applyAuthorizationHeader = (
  config: InternalAxiosRequestConfig,
  token: string,
) => {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;
};

const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await axios.post(`${BASE_URL}auth/refresh/`, {
    refresh: refreshToken,
  });

  const nextAccessToken = response.data?.access as string | undefined;
  const nextRefreshToken =
    (response.data?.refresh as string | undefined) ?? refreshToken;

  if (!nextAccessToken) {
    return null;
  }

  await saveAuthTokens({
    access: nextAccessToken,
    refresh: nextRefreshToken,
  });

  return nextAccessToken;
};

axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        applyAuthorizationHeader(config, token);
      }
    } catch (e) {
      console.warn("Failed to fetch token from storage:", e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const nextAccessToken = await refreshPromise;

      if (!nextAccessToken) {
        throw new Error("No access token returned from refresh");
      }

      applyAuthorizationHeader(originalRequest, nextAccessToken);
      return axiosClient(originalRequest);
    } catch (refreshError) {
      await clearAuthTokens();
      await notifyUnauthorized();
      return Promise.reject(refreshError);
    }
  },
);
