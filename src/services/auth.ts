import { apiRequest } from "@/lib/api";

/** Rol del usuario en el backend. */
export type UserRole = "admin" | "turista";

/** Usuario que devuelve el login (incompleto: sin apellido, teléfono ni avatar). */
export type AuthUser = {
  id: string;
  email: string;
  rol: UserRole;
  nombre: string;
};

/** Respuesta de `POST /api/v1/core/auth/login/`. */
export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  /** segundos de vida del access token (86400 = 24 h) */
  expires_in: number;
  user: AuthUser;
};

/** Perfil completo de `GET /api/v1/core/auth/me/`. */
export type Profile = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  avatar: string;
  rol: UserRole;
  activo: boolean;
  created_at: string;
  last_login: string;
  preferences: Record<string, unknown>;
};

/** Inicia sesión. POST /api/v1/core/auth/login/ (responde JSON plano, sin sobre). */
export function login({ email, password }: { email: string; password: string }) {
  return apiRequest<LoginResponse>("/core/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

/** Renueva el access token. POST /api/v1/core/auth/refresh/ */
export function refreshSession(refreshToken: string) {
  return apiRequest<LoginResponse>("/core/auth/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

/** Perfil completo del usuario autenticado. GET /api/v1/core/auth/me/ */
export function fetchProfile(accessToken: string) {
  return apiRequest<Profile>("/core/auth/me/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}