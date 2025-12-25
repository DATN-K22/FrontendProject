export const authUtils = {
  // Lưu thông tin user sau khi login
  setAuth: (token: string, userRole: string, userData = {}) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("user", JSON.stringify(userData));
  },

  // Lấy thông tin user
  getAuth: () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    return { token, userRole, userData };
  },

  // Xóa thông tin khi logout
  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    localStorage.removeItem("user"); // Also remove "user" key for compatibility
  },

  // Check có phải admin không
  isAdmin: () => {
    return localStorage.getItem("userRole") === "admin";
  },

  // Check đã login chưa
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Check role
  hasRole: (role: string) => {
    return localStorage.getItem("userRole") === role;
  },
};