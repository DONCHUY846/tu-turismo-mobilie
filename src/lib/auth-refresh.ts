import { API_URL } from "@/lib/config";
import type { AuthUser } from "@/services/auth";

/**
 * Respuesta de `POST /api/v1/core/auth/refresh/`.
 *
 * A diferencia del login, el backend puede devolver solo el access token:
 * el refresh token se conserva si no viene uno nuevo, y el usuario se mantiene
 * si la respuesta no lo incluye.
 */
export type RefreshResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  /** segundos de vida del access token */
  expires_in: number;
  user?: AuthUser;
};

/**
 * Pide un access token nuevo con el refresh token.
 * POST /api/v1/core/auth/refresh/
 *
 * Devuelve `null` si el refresh token ya no sirve (o si hubo un error de red):
 * el llamador decide qué hacer, que en este caso es cerrar la sesión.
 *
 * No usa `apiRequest` a propósito: el transporte depende de este módulo para
 * refrescar, así que llamarlo desde aquí sería un ciclo de imports.
 */
export async function requestRefresh(
  refreshToken: string
): Promise<RefreshResponse | null> {
  if (!refreshToken) return null;

  let response: Response;
  try {
    response = await fetch(`${API_URL}/core/auth/refresh/`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    // fallo de red: se trata igual que un refresh inválido
    return null;
  }

  if (!response.ok) return null;

  try {
    const payload = (await response.json()) as RefreshResponse & {
      data?: RefreshResponse;
    };
    // El backend puede responder plano o envuelto en `{ success, data }`.
    const result = payload?.access_token ? payload : payload?.data;
    return result?.access_token ? result : null;
  } catch {
    return null;
  }
}
