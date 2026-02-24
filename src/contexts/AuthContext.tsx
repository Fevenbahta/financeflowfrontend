import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/services/api";

interface User {
  id: string;
  username: string;
  email: string;
  monthly_income?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  register: (data: { username: string; email: string; monthly_income?: number }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("wf_token");
    const savedUser = localStorage.getItem("wf_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    const res = await authApi.login(email);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem("wf_token", res.token);
    localStorage.setItem("wf_user", JSON.stringify(res.user));
  };

  const register = async (data: { username: string; email: string; monthly_income?: number }) => {
    const res = await authApi.register(data);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem("wf_token", res.token);
    localStorage.setItem("wf_user", JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("wf_token");
    localStorage.removeItem("wf_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
