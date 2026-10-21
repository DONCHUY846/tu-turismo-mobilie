import { apiFetch } from "@/lib/api";

/** Restaurante devuelto por `/api/v1/core/restaurants/`. */
export type Restaurant = {
  id: string;
  nombre: string;
  municipio: string;
  /** suele venir vacía */
  categoria: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  /** texto libre, ej. `"lunes a viernes 11:00 pm a 21:30"` */
  horario: string;
  /** viene vacía en todos los registros */
  precio_rango: string;
  imagen_url: string;
  coordenadas: { lng: number; lat: number } | null;
  calificacion: number | null;
  activo: boolean;
  tags: string[];
};

export type FetchRestaurantsParams = {
  limit?: number;
};

/** Lista de restaurantes. GET /api/v1/core/restaurants/ */
export function fetchRestaurants({ limit }: FetchRestaurantsParams = {}) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  const query = params.toString();

  return apiFetch<Restaurant[]>(`/core/restaurants/${query ? `?${query}` : ""}`);
}

/**
 * Un restaurante por id. GET /api/v1/core/restaurants/{id}/
 *
 * La respuesta es la misma que un elemento de la lista, así que también pasa
 * por `apiFetch`. Se usa, entre otras cosas, para hidratar los favoritos.
 */
export function fetchRestaurant(id: string) {
  return apiFetch<Restaurant>(`/core/restaurants/${id}/`);
}