/**
 * Cliente HTTP del backend de Tu Turismo.
 *
 * Casi todos los endpoints responden con el sobre `{ success, data }` (y `count`
 * en listas), que `apiFetch` desenvuelve. Los endpoints de auth responden con el
 * JSON plano, para esos se usa `apiRequest`.
 */

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://tuturismo-backend.onrender.com/api/v1";

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

/** Ejecuta la petición y devuelve el JSON crudo (sin desenvolver el sobre). */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch (error) {
    // fallo de red (sin señal, CORS en web, timeout...)
    throw new ApiError(error instanceof Error ? error.message : "Error de red");
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
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const payload = await apiRequest<ApiEnvelope<T>>(path, init);
  // TODO: cuando el backend devuelva `message` con los errores, usarlo aquí.
  return payload.data;
}