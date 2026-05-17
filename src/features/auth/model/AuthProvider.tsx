import { useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/authApi";
import {
  removeAccessToken,
  saveAccessToken,
} from "../../../shared/lib/authStorage";
import type { LoginPayload, RegisterPayload, User } from "./auth.types";
import { AuthContext, type AuthContextValue } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await authApi.me();

        setUser(currentUser);
      } catch {
        removeAccessToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(payload: LoginPayload) {
    const response = await authApi.login(payload);

    saveAccessToken(response.accessToken);
    setUser(response.user);
  }

  async function register(payload: RegisterPayload) {
    await authApi.register(payload);
  }

  async function logout() {
    await authApi.logout().catch(() => null);

    removeAccessToken();
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
