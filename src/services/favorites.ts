import { apiFetch } from "@/lib/api";

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

/** `referencia_id` de los favoritos de un tipo, en el orden que los devuelve la API. */
export function favoriteIds(favorites: Favorite[], tipo: FavoriteTipo) {
  return favorites.filter((favorite) => favorite.tipo === tipo).map((f) => f.referencia_id);
}
