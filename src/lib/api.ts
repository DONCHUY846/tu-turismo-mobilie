/**
 * Cliente HTTP del backend de Tu Turismo.
 *
 * Casi todos los endpoints responden con el sobre `{ success, data }` (y `count`
 * en listas), que `apiFetch` desenvuelve. Los endpoints de auth responden con el
 * JSON plano, por eso se usan `apiRequest`.
 *
 * El transporte es el dueño de la sesión: inyecta el `Authorization` de la
 * sesión activa, renueva el access token cuando hace falta y reintenta la
 * petición una sola vez. Así los servicios no manejan tokens (y nunca mandan uno
 * vencido).
 */

import { requestRefresh } from "@/lib/auth-refresh";
import { API_URL } from "@/lib/config";
import { useAuthStore } from "@/stores/auth-store";

export { API_URL };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    /** detalle que devuelve el backend, ej. "El email o la contraseña son incorrectos." */
    readonly detail?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Cuerpo de error del backend: `{ error, detail }`. */
type ApiErrorEnvelope = {
  error?: string;
  detail?: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data: T;
  message?: string;
};

/** Opciones propias del cliente, además de las de `fetch`. */
export type ApiRequestInit = RequestInit & {
  /**
   * `false` en los endpoints de auth (login y refresh): no se manda el token de
   * la sesión ni se intenta renovarlo cuando responden 401.
   */
  authenticated?: boolean;
};

/**
 * Con cuánta anticipación se renueva el access token: si vence en menos de esto,
 * se refresca antes de gastar la petición (y el 401 que vendría después).
 */
const PROACTIVE_REFRESH_WINDOW_MS = 2 * 60 * 1000;

/**
 * Refresh en curso. Si varias peticiones reciben 401 a la vez (por ejemplo la
 * lista de favoritos y sus detalles), todas esperan al mismo refresh en vez de
 * disparar uno cada una.
 */
let refreshInFlight: Promise<string | null> | null = null;

function getSession() {
  const { accessToken, refreshToken, expiresAt } = useAuthStore.getState();
  return { accessToken, refreshToken, expiresAt };
}

/**
 * Renueva el access token y lo guarda en el store.
 *
 * Devuelve el token nuevo, o `null` si el refresh token también había expirado
 * (en ese caso la sesión queda cerrada).
 */
function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const { refreshToken } = getSession();
      if (!refreshToken) return null;

      const response = await requestRefresh(refreshToken);
      if (!response) {
        // El refresh token también murió: la sesión se cierra y la app vuelve
        // al login.
        useAuthStore.getState().expireSession();
        return null;
      }

      useAuthStore.getState().applyRefresh(response);
      return response.access_token;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

/** Ejecuta la petición y devuelve el JSON crudo (sin desenvolver el sobre). */
export async function apiRequest<T>(
  path: string,
  init?: ApiRequestInit
): Promise<T> {
  return request<T>(path, init, true);
}

/**
 * Petición con manejo de sesión.
 *
 * @param allowRefresh si es `false`, un 401 no dispara un refresh (evita el
 * bucle infinito de reintentos).
 */
async function request<T>(
  path: string,
  init: ApiRequestInit | undefined,
  allowRefresh: boolean
): Promise<T> {
  const authenticated = init?.authenticated !== false;
  const { accessToken, refreshToken, expiresAt } = getSession();

  let token = authenticated ? accessToken : null;

  // Refresh preventivo: si el token está por vencer, se renueva antes de
  // gastar la petición.
  if (
    authenticated &&
    token &&
    refreshToken &&
    expiresAt > 0 &&
    expiresAt - Date.now() < PROACTIVE_REFRESH_WINDOW_MS
  ) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      throw new ApiError("Tu sesión expiró. Vuelve a iniciar sesión.", 401);
    }
    token = refreshed;
  }

  const { authenticated: _authenticated, ...fetchInit } = init ?? {};
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((init?.headers ?? {}) as Record<string, string>),
  };
  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...fetchInit, headers });
  } catch (error) {
    // fallo de red (sin señal, CORS en web, timeout...)
    throw new ApiError(error instanceof Error ? error.message : "Error de red");
  }

  // 401 con sesión activa: se renueva el token y se reintenta una sola vez.
  if (response.status === 401 && authenticated && allowRefresh && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, init, false);
    }
  }

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const payload = (await response.json()) as ApiErrorEnvelope;
      detail = payload.detail ?? payload.error;
    } catch {
      // algunos gateways devuelven HTML (ej. el reto de Cloudflare)
    }
    throw new ApiError(
      detail ?? `Error ${response.status} al pedir ${path}`,
      response.status,
      detail
    );
  }

  return (await response.json()) as T;
}

/** Petición a un endpoint con sobre `{ success, data }`; devuelve solo `data`. */
export async function apiFetch<T>(
  path: string,
  init?: ApiRequestInit
): Promise<T> {
  const payload = await apiRequest<ApiEnvelope<T>>(path, init);
  // TODO: cuando el backend devuelva `message` con los errores, usarlo aquí.
  return payload.data;
}
