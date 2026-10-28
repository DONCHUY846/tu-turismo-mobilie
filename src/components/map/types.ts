import {
  CalendarDays,
  Layers,
  MapPin,
  Utensils,
  type LucideIcon,
} from "lucide-react-native";

import type { Event } from "@/services/events";
import type { Place } from "@/services/places";
import type { Restaurant } from "@/services/restaurants";

/** Tipos de recurso que el mapa muestra (misma terna que la web). */
export type MarkerKind = "place" | "restaurant" | "event";

/**
 * Color e ícono de cada tipo: lo usan los markers (burbuja), los chips de
 * filtro y el badge del sheet, para que todo hable el mismo idioma visual.
 */
export const KIND_META: Record<MarkerKind, { label: string; container: string; icon: LucideIcon }> = {
  place: { label: "Lugares", container: "bg-blue-500", icon: MapPin },
  restaurant: { label: "Restaurantes", container: "bg-amber-500", icon: Utensils },
  event: { label: "Eventos", container: "bg-violet-500", icon: CalendarDays },
};

/** chip "Todos": sin color de tipo, va en el color de texto (foreground) */
export const KIND_ALL_META = { label: "Todos", container: "bg-foreground", icon: Layers };

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
