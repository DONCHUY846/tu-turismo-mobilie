import { apiFetch } from "@/lib/api";

/** Evento devuelto por `/api/v1/core/events/`. */
export type Event = {
  id: string;
  nombre: string;
  descripcion: string;
  /** suele venir vacía */
  categoria: string;
  municipio: string;
  /** llega como `"2026-07-25"` o `"2026-09-03 00:00:00"` */
  fecha_inicio: string;
  /** llega vacía; cuando existe se muestra como rango */
  fecha_fin: string;
  imagen_url: string;
  coordenadas: { lng: number; lat: number } | null;
  activo: boolean;
  tags: string[];
};

export type FetchEventsParams = {
  /** la API soporta `limit` pero no ordenamiento */
  limit?: number;
};

/** Lista de eventos. GET /api/v1/core/events/ */
export function fetchEvents({ limit }: FetchEventsParams = {}) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  const query = params.toString();

  return apiFetch<Event[]>(`/core/events/${query ? `?${query}` : ""}`);
}