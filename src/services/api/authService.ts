import { axiosClient } from "./axiosClient";

export const AuthService = {
  login: async (credentials: any) => {
    const response = await axiosClient.post("auth/login/", credentials);
    return response.data;
  },

  register: async (userData: any) => {
    // schema calls for username, email, password
    const response = await axiosClient.post("auth/register/", userData);
    return response.data;
  },

  me: async () => {
    const response = await axiosClient.get("auth/me/");
    return response.data;
  },

  refreshToken: async (refresh: string) => {
    const response = await axiosClient.post("auth/refresh/", { refresh });
    return response.data;
  }
};
