import { apiFetch } from "@/lib/api";

/** Lugar touristico devuelto por `/api/v1/core/places/`. */
export type Place = {
  id: string;
  nombre: string;
  municipio: string;
  /** suele venir vacía; cuando viene, se muestra como badge en la card */
  categoria: string;
  descripcion: string;
  direccion: string;
  imagen_url: string;
  coordenadas: { lng: number; lat: number } | null;
  activo: boolean;
  tags: string[];
  rating_promedio: number | null;
  calificacion: number | null;
  reviews_count: number;
};

export type FetchPlacesParams = {
  /** la API soporta `limit` pero no paginación */
  limit?: number;
  categoria?: string;
};

/** Lista de lugares. GET /api/v1/core/places/ */
export function fetchPlaces({ limit, categoria }: FetchPlacesParams = {}) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (categoria) params.set("categoria", categoria);
  const query = params.toString();

  return apiFetch<Place[]>(`/core/places/${query ? `?${query}` : ""}`);
}