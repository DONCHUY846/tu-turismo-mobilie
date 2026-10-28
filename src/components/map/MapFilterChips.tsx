import * as React from "react";
import { Pressable, ScrollView } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text as UIText } from "@/components/ui/text";
import { KIND_ALL_META, KIND_META, type MarkerKind } from "./types";

/** Filtro activo de los chips: el tipo de recurso o "todos". */
export type MapFilter = "all" | MarkerKind;

const ORDER: MapFilter[] = ["all", "place", "restaurant", "event"];

export type MapFilterChipsProps = {
  value: MapFilter;
  onChange: (filter: MapFilter) => void;
  /** conteo por filtro, para mostrarlo en la píldora */
  counts: Record<MapFilter, number>;
};

/**
 * Fila de píldoras para filtrar el mapa por tipo de recurso. Van en flujo
 * normal (encima del mapa, no como overlay): un ScrollView horizontal
 * montado sobre el MapView pelea los gestos con el mapa.
 */
export function MapFilterChips({ value, onChange, counts }: MapFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="bg-background"
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
    >
      {ORDER.map((filter) => {
        const meta = filter === "all" ? KIND_ALL_META : KIND_META[filter];
        const active = value === filter;

        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por ${meta.label}`}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(filter)}
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 shadow-sm ${
              active ? meta.container : "bg-card ring-1 ring-border"
            }`}
          >
            <Icon as={meta.icon} size={13} className={active ? "text-white" : "text-muted-foreground"} />
            <UIText className={`text-xs font-semibold ${active ? "text-white" : "text-foreground"}`}>
              {meta.label}
            </UIText>
            <UIText className={`text-[10px] font-medium ${active ? "text-white/70" : "text-muted-foreground"}`}>
              {counts[filter]}
            </UIText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
