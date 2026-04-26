import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_DOMAIN = "https://musicapp-production-bcd8.up.railway.app";
export const API_PREFIX = "/api/";
export const BASE_URL = `${BASE_DOMAIN}${API_PREFIX}`;

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Failed to fetch token from storage:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
