/**
 * Cliente HTTP del backend de Tu Turismo.
 *
 * El backend responde con el sobre `{ success, data }` (y `count` en listas),
 * así que `apiFetch` lo desenvuelve y devuelve solo `data`.
 */

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://tuturismo-backend.onrender.com/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiEnvelope<T> = {
  success?: boolean;
  data: T;
  message?: string;
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
    throw new ApiError(`Error ${response.status} al pedir ${path}`, response.status);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  // TODO: cuando el backend devuelva mensajes de error, usar `payload.message`.
  return payload.data;
}