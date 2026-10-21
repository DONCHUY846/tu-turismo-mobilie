import { useQueries, useQuery } from "@tanstack/react-query";
import * as React from "react";

import { fetchEvent } from "@/services/events";
import { favoriteIds, fetchFavorites } from "@/services/favorites";
import { fetchPlace } from "@/services/places";
import { fetchRestaurant } from "@/services/restaurants";
import type { Event } from "@/services/events";
import type { Place } from "@/services/places";
import type { Restaurant } from "@/services/restaurants";

export type UseFavoritesParams = {
  accessToken?: string | null;
  /** entra en la `queryKey` para no mezclar los favoritos de dos sesiones */
  userId?: string | null;
  /** mientras sea `false` no se pide nada (invitado, o sesión rehidratándose) */
  enabled?: boolean;
};

export type FavoritesResult = {
  places: Place[];
  events: Event[];
  restaurants: Restaurant[];
  /** `true` mientras falte la lista o algún detalle por cargar */
  isPending: boolean;
  /** solo refleja la falla de la lista: un detalle caído no vacía la sección */
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Favoritos del usuario ya hidratados: pide `/core/favorites/` y después trae el
 * detalle de cada referencia (un lugar, evento o restaurante).
 *
 * Un recurso que ya no exista en el catálogo (404) se salta en silencio para no
 * tirar la sección entera. Por eso `isError` solo mira la lista.
 */
export function useFavorites({
  accessToken,
  userId,
  enabled = true,
}: UseFavoritesParams): FavoritesResult {
  const isReady = enabled && Boolean(accessToken);

  const favorites = useQuery({
    queryKey: ["favorites", userId ?? null],
    queryFn: () => fetchFavorites(accessToken ?? ""),
    enabled: isReady,
  });

  const list = favorites.data;

  const placeIds = React.useMemo(
    () => (list ? favoriteIds(list, "lugar") : []),
    [list]
  );
  const eventIds = React.useMemo(
    () => (list ? favoriteIds(list, "evento") : []),
    [list]
  );
  const restaurantIds = React.useMemo(
    () => (list ? favoriteIds(list, "restaurante") : []),
    [list]
  );

  const placeQueries = useQueries({
    queries: placeIds.map((id) => ({
      queryKey: ["place", id],
      queryFn: () => fetchPlace(id),
      enabled: isReady,
      // Un lugar borrado del catálogo no debe reintentarse ni romper la lista.
      retry: false,
    })),
  });

  const eventQueries = useQueries({
    queries: eventIds.map((id) => ({
      queryKey: ["event", id],
      queryFn: () => fetchEvent(id),
      enabled: isReady,
      retry: false,
    })),
  });

  const restaurantQueries = useQueries({
    queries: restaurantIds.map((id) => ({
      queryKey: ["restaurant", id],
      queryFn: () => fetchRestaurant(id),
      enabled: isReady,
      retry: false,
    })),
  });

  // `useQueries` conserva el orden de los ids, así que se puede indexar en
  // paralelo y mantener el orden en que el usuario guardó cada cosa.
  const places = placeIds.flatMap((_, index) => {
    const place = placeQueries[index]?.data;
    return place ? [place] : [];
  });
  const events = eventIds.flatMap((_, index) => {
    const event = eventQueries[index]?.data;
    return event ? [event] : [];
  });
  const restaurants = restaurantIds.flatMap((_, index) => {
    const restaurant = restaurantQueries[index]?.data;
    return restaurant ? [restaurant] : [];
  });

  const details = [...placeQueries, ...eventQueries, ...restaurantQueries];

  return {
    places,
    events,
    restaurants,
    isPending:
      favorites.isPending || details.some((query) => query.isPending && query.fetchStatus !== "idle"),
    isError: favorites.isError,
    error: favorites.error ?? null,
    refetch: () => {
      void favorites.refetch();
    },
  };
}
