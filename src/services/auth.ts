import { requestRefresh, type RefreshResponse } from "@/lib/auth-refresh";
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

/**
 * Inicia sesión. POST /api/v1/core/auth/login/ (responde JSON plano, sin sobre).
 *
 * No se manda el token de la sesión: `authenticated: false` evita que el
 * transporte lo inyecte o intente renovarlo.
 */
export function login({ email, password }: { email: string; password: string }) {
  return apiRequest<LoginResponse>("/core/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    authenticated: false,
  });
}

/**
 * Renueva el access token. POST /api/v1/core/auth/refresh/
 *
 * El transporte lo usa por su cuenta cuando una petición recibe 401; queda
 * expuesta para casos puntuales. Devuelve `null` si el refresh token ya no sirve.
 */
export function refreshSession(
  refreshToken: string
): Promise<RefreshResponse | null> {
  return requestRefresh(refreshToken);
}

/**
 * Perfil completo del usuario autenticado. GET /api/v1/core/auth/me/
 *
 * El token lo pone el transporte, que además lo renueva si hace falta.
 */
export function fetchProfile() {
  return apiRequest<Profile>("/core/auth/me/");
}