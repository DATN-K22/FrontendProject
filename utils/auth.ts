import api from "@/api/api";
import { ApiResponse } from "./dto/ApiResponse";

export const authUtils = {
  setAuth: (
    token: string,
    userRole: string,
    // userData: Record<string, any> = {},
    rememberMe: boolean = false,
  ) => {
    if (typeof window === "undefined") return;

    const storage = rememberMe ? localStorage : sessionStorage;
    console.log("Setting auth with token:", token, "and role:", userRole);
    storage.setItem("accessToken", token);
    storage.setItem("userRole", userRole);
  },

  getAuth: () => {
    if (typeof window === "undefined") {
      return { token: null, userRole: null, userData: {} };
    }
    const token = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    return { token, userRole, userData };
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
    }
  },
};
