import {
  CalendarDays,
  Compass,
  Heart,
  Landmark,
  Utensils,
  type LucideIcon,
} from "lucide-react-native";

import type { Event } from "@/services/events";
import type { Place } from "@/services/places";
import type { Restaurant } from "@/services/restaurants";

/** Tipos de recurso que el mapa muestra (misma terna que la web). */
export type MarkerKind = "place" | "restaurant" | "event";

/** Filtro activo en el rail del mapa: todos, por tipo o favoritos del usuario. */
export type MapFilter = "all" | MarkerKind | "favorites";

export type CategoryMeta = {
  label: string;
  /** clase Tailwind para el fondo activo (pin y botón del rail) */
  container: string;
  icon: LucideIcon;
};

/**
 * Color e ícono de cada tipo de recurso (espejado de `https://tu-turismo.com.mx/map`):
 * lo comparten las burbujas de los markers y el rail lateral de categorías.
 */
export const KIND_META: Record<MarkerKind, CategoryMeta> = {
  place: { label: "Lugares", container: "bg-blue-600", icon: Landmark },
  restaurant: { label: "Restaurantes", container: "bg-orange-600", icon: Utensils },
  event: { label: "Eventos", container: "bg-emerald-600", icon: CalendarDays },
};

/** Metadatos de todas las opciones del rail lateral (sin Museos/Paleta). */
export const RAIL_META: Record<MapFilter, CategoryMeta> = {
  all: { label: "Todos", container: "bg-blue-600", icon: Compass },
  ...KIND_META,
  favorites: { label: "Favoritos", container: "bg-rose-600", icon: Heart },
};

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
