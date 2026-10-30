import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { CardSkeleton } from "@/components/CardSkeleton";
import { PlaceCard } from "@/components/PlaceCard";
import { SectionErrorState } from "@/components/SectionErrorState";
import { SectionHeader } from "@/components/SectionHeader";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { fetchPlaces } from "@/services/places";
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
  const router = useRouter();
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
            <CardSkeleton key={index} />
          ))}
        </View>
      ) : null}

      {isError ? (
        <SectionErrorState
          title="No pudimos cargar los lugares"
          detail={error?.message ?? "Revisa tu conexión e inténtalo de nuevo."}
          onRetry={() => void refetch()}
        />
      ) : null}

      {places.length > 0 ? (
        <View className={cn("gap-4", isRefetching && "opacity-60")}>
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} onPressMore={() => router.push({ pathname: "/explorar", params: { kind: "place", id: place.id } })} />
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