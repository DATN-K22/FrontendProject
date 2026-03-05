export const authUtils = {
  setAuth: (token: string, userRole: string, rememberMe: boolean = false) => {
    if (typeof window === "undefined") return;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("accessToken", token);
    storage.setItem("userRole", userRole);
  },

  getAuth: () => {
    if (typeof window === "undefined") {
      return { token: null, userRole: null, userData: {} };
    }
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    const userRole =
      localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    return { token, userRole, userData };
  },

  clearAuth: () => {
    if (typeof window === "undefined") return;
    ["accessToken", "userRole", "userData", "user"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  },

  isAuthenticated: () => {
    if (typeof window === "undefined") return false;
    return (
      !!localStorage.getItem("accessToken") ||
      !!sessionStorage.getItem("accessToken")
    );
  },

  isAdmin: () => {
    if (typeof window === "undefined") return false;
    const role =
      localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    return role === "admin";
  },

  hasRole: (role: string) => {
    if (typeof window === "undefined") return false;
    const userRole =
      localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    return userRole === role;
  },
};
