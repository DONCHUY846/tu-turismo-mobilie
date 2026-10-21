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

/** Campos que acepta `PUT /api/v1/core/auth/me/`. */
export type ProfileUpdate = {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  /** URL de la foto, ya subida */
  avatar?: string;
  /**
   * TODO: el backend responde 500 al recibir este campo (el serializer no
   * llama `set_password`). Se manda igual para que funcione en cuanto se
   * arregle del lado del servidor.
   */
  password?: string;
};

/**
 * Actualiza el perfil del usuario. PUT /api/v1/core/auth/me/
 *
 * Acepta campos sueltos y devuelve el perfil completo ya actualizado.
 */
export function updateProfile(payload: ProfileUpdate) {
  return apiRequest<Profile>("/core/auth/me/", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Archivo listo para mandarse en el `FormData` de la subida. */
export type UploadFile = {
  /** URI local del archivo, p. ej. `file:///.../avatar.jpg` */
  uri: string;
  /** nombre del archivo, p. ej. `avatar.jpg` */
  name: string;
  /** tipo MIME, p. ej. `image/jpeg` */
  type: string;
};

/** Respuesta de `POST /api/v1/core/upload/`. */
export type UploadResponse = {
  url?: string;
  secure_url?: string;
  data?: { url?: string; secure_url?: string };
};

/**
 * Sube una imagen. POST /api/v1/core/upload/
 *
 * El backend acepta el archivo en el campo `file` (o `image`) y lo guarda en la
 * carpeta `folder` de Cloudinary.
 */
export function uploadAvatar(file: UploadFile) {
  const form = new FormData();
  // En React Native, `FormData.append` acepta este objeto con `uri`/`name`/`type`
  // y lo convierte en un archivo multipart; el cast es porque el tipo de DOM
  // solo conoce `Blob`.
  form.append("file", file as unknown as Blob);
  form.append("folder", "tu-turismo/avatars");

  return apiRequest<UploadResponse>("/core/upload/", {
    method: "POST",
    body: form,
  });
}

/**
 * Extrae la URL pública de la imagen de la respuesta del upload.
 *
 * TODO: el backend está caído (500 por la config de Cloudinary), así que no se
 * pudo ver la forma real de la respuesta. Se aceptan las variantes habituales
 * y, cuando el endpoint funcione, se puede dejar solo la buena.
 */
export function extractUploadUrl(payload: UploadResponse): string | null {
  return (
    payload?.data?.url ??
    payload?.data?.secure_url ??
    payload?.url ??
    payload?.secure_url ??
    null
  );
}