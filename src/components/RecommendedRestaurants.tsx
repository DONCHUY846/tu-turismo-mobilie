import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { View } from "react-native";

import { CardSkeleton } from "@/components/CardSkeleton";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SectionErrorState } from "@/components/SectionErrorState";
import { SectionHeader } from "@/components/SectionHeader";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { fetchRestaurants } from "@/services/restaurants";

export type RecommendedRestaurantsProps = {
  /** cuántos restaurantes mostrar */
  limit?: number;
};

/**
 * Sección "Restaurantes Recomendados" de la home.
 *
 * La API no expone un flag de "recomendado" ni orden por calificación, así que
 * se respeta el orden en que los devuelve el backend.
 */
export function RecommendedRestaurants({ limit = 4 }: RecommendedRestaurantsProps) {
  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["restaurants", { limit }],
    queryFn: () => fetchRestaurants({ limit }),
  });

  const restaurants = data ?? [];

  return (
    <View>
      <SectionHeader
        title="Restaurantes Recomendados"
        subtitle="Prueba los sabores tradicionales de nuestra tierra"
        action={
          restaurants.length > 0
            ? {
                label: "Ver todos los restaurantes",
                // TODO: navegar a la pantalla /restaurantes cuando exista.
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
          title="No pudimos cargar los restaurantes"
          detail={error?.message ?? "Revisa tu conexión e inténtalo de nuevo."}
          onRetry={() => void refetch()}
        />
      ) : null}

      {restaurants.length > 0 ? (
        <View className={cn("gap-4", isRefetching && "opacity-60")}>
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </View>
      ) : null}

      {!isPending && !isError && restaurants.length === 0 ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">
          Todavía no hay restaurantes publicados.
        </Text>
      ) : null}
    </View>
  );
}