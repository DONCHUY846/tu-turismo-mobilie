import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { PlaceCard } from "@/components/PlaceCard";
import { PlaceCardSkeleton } from "@/components/PlaceCardSkeleton";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { fetchPlaces, type Place } from "@/services/places";
import { selectPlacesFilters, usePlacesStore } from "@/stores/places-store";

export type FeaturedPlacesProps = {
  /** cuántos lugares mostrar; la API no tiene flag de "destacado" */
  limit?: number;
};

/**
 * Sección "Lugares Destacados" de la home.
 *
 * Estados: carga (skeletons), error (mensaje + reintento) y datos.
 * Los filtros salen del store global de Zustand, que hoy está vacío:
 * la UI para cambiarlos todavía no existe.
 */
export function FeaturedPlaces({ limit = 4 }: FeaturedPlacesProps) {
  const filters = usePlacesStore(selectPlacesFilters);

  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["places", filters],
    queryFn: () => fetchPlaces({ limit, categoria: filters.categoria || undefined }),
  });

  const places = data ?? [];

  return (
    <View>
      <SectionHeader
        title="Lugares Destacados"
        subtitle="Los mejores destinos seleccionados para ti"
        action={
          places.length > 0
            ? {
                label: "Ver todos los lugares",
                // TODO: navegar a la pantalla /lugares cuando exista.
                onPress: () => {},
              }
            : undefined
        }
      />

      {isPending ? (
        <View className="gap-4">
          {Array.from({ length: limit }, (_, index) => (
            <PlaceCardSkeleton key={index} />
          ))}
        </View>
      ) : null}

      {isError ? (
        <View
          className="items-center gap-3 rounded-2xl border border-border bg-card px-4 py-8"
          accessibilityRole="alert"
        >
          <Text className="text-center text-sm font-semibold text-foreground">
            No pudimos cargar los lugares
          </Text>
          <Text className="text-center text-xs text-muted-foreground">
            {error?.message ?? "Revisa tu conexión e inténtalo de nuevo."}
          </Text>
          <Button
            variant="outline"
            onPress={() => void refetch()}
            className="h-auto rounded-lg border-brand-cyan px-3.5 py-1.5 active:bg-brand-cyan/10"
          >
            <Icon as={RotateCw} className="text-brand-cyan" size={14} />
            <Text className="text-xs font-medium text-brand-cyan">Reintentar</Text>
          </Button>
        </View>
      ) : null}

      {places.length > 0 ? (
        <View className={cn("gap-4", isRefetching && "opacity-60")}>
          {places.map((place: Place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </View>
      ) : null}

      {!isPending && !isError && places.length === 0 ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">
          Todavía no hay lugares publicados.
        </Text>
      ) : null}
    </View>
  );
}