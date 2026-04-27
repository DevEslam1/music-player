import { axiosClient } from "./axiosClient";
import { User } from "../../types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export const AuthService = {
  login: async (credentials: LoginCredentials) => {
    const response = await axiosClient.post("auth/login/", credentials);
    return response.data as AuthTokens;
  },

  register: async (userData: RegisterPayload) => {
    const response = await axiosClient.post("auth/register/", userData);
    return response.data;
  },

  me: async () => {
    const response = await axiosClient.get("auth/me/");
    return response.data as User;
  },

  refreshToken: async (refresh: string) => {
    const response = await axiosClient.post("auth/refresh/", { refresh });
    return response.data as Partial<AuthTokens> & { access: string };
  },
};
