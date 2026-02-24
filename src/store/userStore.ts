import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  monthlyIncome?: number;
}

interface UserState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  getUserId: () => string | null;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  setUser: (user, token) => {
    set({ user, token });
    localStorage.setItem("wf_token", token);
  },
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem("wf_token");
  },
  getUserId: () => {
    const token = get().token || localStorage.getItem("wf_token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch {
      return null;
    }
  },
}));