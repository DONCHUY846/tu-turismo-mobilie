import type { Event } from "@/services/events";
import type { Place } from "@/services/places";
import type { Restaurant } from "@/services/restaurants";

/** Tipos de recurso que el mapa muestra (misma terna que la web). */
export type MarkerKind = "place" | "restaurant" | "event";

/**
 * Un pin del mapa, normalizado entre los tres recursos.
 *
 * `item` es el recurso completo tal cual lo mandó la API: el modal de detalle
 * lo muestra sin fetch extra.
 */
export type MapPoint = {
  id: string;
  kind: MarkerKind;
  /** [lng, lat] */
  coordinate: [number, number];
  item: Place | Restaurant | Event;
};
