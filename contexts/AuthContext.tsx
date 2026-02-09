import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { UserProfile, UserPreferences, AuthStatus } from "@/lib/auth-types";
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  apiLogin,
  apiRegister,
  apiGetMe,
  apiSavePreferences,
} from "@/lib/auth";

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  savePreferences: (prefs: UserPreferences) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    (async () => {
      try {
        const stored = await getAuthToken();
        if (!stored) {
          setStatus("logged_out");
          return;
        }

        const profile = await apiGetMe(stored);
        setToken(stored);
        setUser(profile);
        setStatus(profile.preferences ? "logged_in" : "onboarding");
      } catch {
        await clearAuthToken();
        setStatus("logged_out");
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    await setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setStatus(res.user.preferences ? "logged_in" : "onboarding");
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await apiRegister(email, password, name);
    await setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setStatus("onboarding");
  }, []);

  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    if (!token) throw new Error("Not authenticated");
    await apiSavePreferences(token, prefs);
    setUser((prev) => (prev ? { ...prev, preferences: prefs } : prev));
    setStatus("logged_in");
  }, [token]);

  const logout = useCallback(async () => {
    await clearAuthToken();
    setToken(null);
    setUser(null);
    setStatus("logged_out");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        status,
        isLoading: status === "loading",
        isAuthenticated: status === "logged_in" || status === "onboarding",
        needsOnboarding: status === "onboarding",
        login,
        register,
        savePreferences,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
