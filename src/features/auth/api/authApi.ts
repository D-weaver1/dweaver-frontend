import { http } from "@/shared/api/http";
import type {
  LoginPayload,
  LoginResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
  RefreshResponse,
  LogoutResponse,
} from "../model/auth.types";

export const authApi = {
  register(payload: RegisterPayload) {
    return http<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload) {
    return http<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  refresh() {
    return http<RefreshResponse>("/auth/refresh", {
      method: "POST",
    });
  },

  async me() {
    const response = await http<MeResponse>("/auth/me");

    return response.user;
  },

  logout() {
    return http<LogoutResponse>("/auth/logout", {
      method: "POST",
    });
  },
};
