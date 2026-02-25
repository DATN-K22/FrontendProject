"use client";

import { authUtils } from "@/utils/auth";
import { createContext, useContext, useState, ReactNode } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (token: string, userData: User, remember?: boolean) => void;
  logout: () => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (token: string, userData: User, remember = false) => {
    authUtils.setAuth(token, userData.role || "user", remember);
    setUser(userData);
  };

  const logout = () => {
    authUtils.clearAuth();
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
};
