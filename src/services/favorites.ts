import { apiFetch, apiRequest } from "@/lib/api";

/** Tipo de recurso guardado como favorito (enum del backend). */
export type FavoriteTipo = "lugar" | "evento" | "restaurante";

/**
 * Favorito guardado por el usuario.
 *
 * El backend solo guarda la referencia: no manda el nombre ni la imagen del
 * recurso, así que la UI necesita hidratar `referencia_id` contra el detalle del
 * recurso correspondiente (ver `useFavorites`).
 */
export type Favorite = {
  id: string;
  user_id: string;
  tipo: FavoriteTipo;
  /** id del lugar, evento o restaurante guardado */
  referencia_id: string;
  /** llega como `"2026-08-10 17:50:36.275000"` o ISO con offset */
  created_at: string;
};

/** Favoritos del usuario autenticado. GET /api/v1/core/favorites/ */
export function fetchFavorites() {
  return apiFetch<Favorite[]>("/core/favorites/");
}

/**
 * Guarda un recurso como favorito del usuario. POST /api/v1/core/favorites/
 *
 * El body usa el nombre del campo que espera el backend (`referencia_id`), con
 * el id del recurso (lugar, evento o restaurante), no el id del favorito.
 * Responde con el sobre `{ success, data: Favorite, message }`: por eso va
 * con `apiFetch`.
 */
export function createFavorite({
  tipo,
  referenciaId,
}: {
  tipo: FavoriteTipo;
  referenciaId: string;
}) {
  return apiFetch<Favorite>("/core/favorites/", {
    method: "POST",
    body: JSON.stringify({ tipo, referencia_id: referenciaId }),
  });
}

/**
 * Quita un favorito del usuario. DELETE /api/v1/core/favorites/{referencia_id}/
 *
 * Confirmado contra el backend (captura del 27 oct 2026): el DELETE va con el
 * `referencia_id` del recurso en la URL — no con el id del favorito — y
 * responde el sobre `{ success, message }` **sin** `data`; por eso va con
 * `apiRequest` (JSON plano) y no con `apiFetch` (devolvería `undefined`).
 */
export function deleteFavorite(referenciaId: string) {
  return apiRequest<{ success: boolean; message?: string }>(
    `/core/favorites/${referenciaId}/`,
    { method: "DELETE" }
  );
}

/** `referencia_id` de los favoritos de un tipo, en el orden que los devuelve la API. */
export function favoriteIds(favorites: Favorite[], tipo: FavoriteTipo) {
  return favorites.filter((favorite) => favorite.tipo === tipo).map((f) => f.referencia_id);
}
