import * as React from "react";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { RAIL_META, type MapFilter } from "./types";

const BASE_FILTERS: MapFilter[] = ["all", "place", "restaurant", "event"];

export type MapCategoryRailProps = {
  value: MapFilter;
  onChange: (filter: MapFilter) => void;
  /** muestra el botón de Favoritos solo cuando hay sesión activa */
  showFavorites: boolean;
};

/**
 * Rail vertical flotante de categorías a la izquierda del mapa, espejado de
 * `https://tu-turismo.com.mx/map` (descartando Museos/Paleta):
 * Todos (`Compass`), Lugares (`Landmark`), Restaurantes (`Utensils`),
 * Eventos (`CalendarDays`) y Favoritos (`Heart`, solo con sesión).
 *
 * Se monta como hermano absoluto sobre el `Map` para no partir la pantalla
 * ni quitarle altura al mapa.
 */
export function MapCategoryRail({
  value,
  onChange,
  showFavorites,
}: MapCategoryRailProps) {
  const filters: MapFilter[] = showFavorites
    ? [...BASE_FILTERS, "favorites"]
    : BASE_FILTERS;

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-3 top-0 z-10 justify-center"
    >
      <View className="gap-2.5">
        {filters.map((filter) => {
          const meta = RAIL_META[filter];
          const active = value === filter;

          return (
            <Pressable
              key={filter}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar por ${meta.label}`}
              accessibilityState={{ selected: active }}
              onPress={() => onChange(filter)}
              style={{ elevation: active ? 6 : 4 }}
              className={cn(
                "h-11 w-11 items-center justify-center rounded-2xl border shadow-md",
                active
                  ? cn(meta.container, "border-white/40")
                  : "border-border bg-white/95"
              )}
            >
              <Icon
                as={meta.icon}
                size={20}
                className={active ? "text-white" : "text-slate-600"}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
