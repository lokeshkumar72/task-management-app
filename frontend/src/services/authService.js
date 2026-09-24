import api from "./api";
import { tokenManager } from "../utils/tokenManager";

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    const { accessToken, refreshToken, user } = response.data.data;

    tokenManager.setTokens(accessToken, refreshToken);
    return { user, accessToken, refreshToken };
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const { accessToken, refreshToken, user } = response.data.data;

    tokenManager.setTokens(accessToken, refreshToken);
    return { user, accessToken, refreshToken };
  },

  // Logout user
  logout: () => {
    tokenManager.clearTokens();
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data.data.user;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!tokenManager.getAccessToken();
  },
};
