// authUtils.ts - Keep as utility functions only
export const authUtils = {
  setAuth: (
    token: string,
    userRole: string,
    // userData: Record<string, any> = {},
    rememberMe: boolean = false
  ) => {
    if (typeof window === "undefined") return;

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem("accessToken", token);
    storage.setItem("userRole", userRole);
    // storage.setItem("userData", JSON.stringify(userData));
  },

  getAuth: () => {
    if (typeof window === 'undefined') {
      return { token: null, userRole: null, userData: {} };
    }
    const token = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    return { token, userRole, userData };
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
    }
  },

  isAdmin: () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem("userRole") === "admin";
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem("accessToken");
  },

  hasRole: (role: string) => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem("userRole") === role;
  },
};