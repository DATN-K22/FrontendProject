export const authUtils = {
  setAuth: (
    token: string,
    userData: Record<string, any> = {},
    rememberMe: boolean = false,
  ) => {
    if (typeof window === "undefined") return;

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("accessToken", token);
    storage.setItem("userData", JSON.stringify(userData));
  },

  getAuth: () => {
    if (typeof window === "undefined") {
      return { token: null, userData: null };
    }

    const token =
      localStorage.getItem("accessToken") ??
      sessionStorage.getItem("accessToken");

    const userDataRaw =
      localStorage.getItem("userData") ?? sessionStorage.getItem("userData");

    const userData = userDataRaw ? JSON.parse(userDataRaw) : null;

    return { token, userData };
  },

  clearAuth: () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userData");
  },
};
