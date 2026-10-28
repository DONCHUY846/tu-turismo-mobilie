import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import {
  createFavorite,
  deleteFavorite,
  fetchFavorites,
  type Favorite,
  type FavoriteTipo,
} from "@/services/favorites";
import { selectIsAuthenticated, useAuthStore } from "@/stores/auth-store";

export type UseFavoriteToggleResult = {
  /** ¿El recurso con ese id está en los favoritos del usuario? */
  isFavorite: (referenciaId: string, tipo: FavoriteTipo) => boolean;
  /** Agrega o quita el favorito, con la caché optimista de por medio. */
  toggle: (referenciaId: string, tipo: FavoriteTipo) => void;
  /** `true` mientras la mutación está en vuelo (deshabilita el botón). */
  isToggling: boolean;
};

type ToggleVariables = {
  referenciaId: string;
  tipo: FavoriteTipo;
  add: boolean;
};

/** `deleteFavorite` responde el sobre sin `data`; `createFavorite` trae `Favorite`. */
type ToggleResult = Favorite | { success: boolean; message?: string };

type ToggleContext = {
  previous: Favorite[] | undefined;
  key: readonly ["favorites", string | null];
};

/**
 * Alternar un favorito con actualización optimista.
 *
 * Lee la MISMA query que el Perfil (`["favorites", userId]`, ver
 * `useFavorites`) para compartir la caché, y en `toggle` escribe la caché al
 * instante: si falla, revierte al snapshot y la invalidación del `onSettled`
 * re-sincroniza con lo que dice el servidor (cubre el caso de favorito
 * eliminado en otro dispositivo o de alta duplicada).
 *
 * Para invitados (sin sesión) la query no se pide y `toggle` no hace nada: el
 * botón de favorito no se muestra en ese caso, este es solo el guard de fondo.
 */
export function useFavoriteToggle(): UseFavoriteToggleResult {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const userId = useAuthStore((state) => state.user.id);
  const enabled = isAuthenticated && !!userId;

  const favorites = useQuery({
    queryKey: ["favorites", userId ?? null],
    queryFn: () => fetchFavorites(),
    enabled,
  });

  const mutation = useMutation<ToggleResult, Error, ToggleVariables, ToggleContext>({
    mutationFn: async ({ referenciaId, tipo, add }) => {
      if (add) {
        return createFavorite({ tipo, referenciaId });
      }
      return deleteFavorite(referenciaId);
    },

    onMutate: async ({ referenciaId, tipo, add }) => {
      const key = ["favorites", userId ?? null] as const;
      const previous = queryClient.getQueryData<Favorite[]>(key);
      const list = previous ?? [];

      const next = add
        ? [
            ...list.filter((favorite) => favorite.referencia_id !== referenciaId),
            {
              id: `optimista-${referenciaId}`,
              user_id: userId ?? "",
              tipo,
              referencia_id: referenciaId,
              created_at: "",
            },
          ]
        : list.filter((favorite) => favorite.referencia_id !== referenciaId);

      queryClient.setQueryData(key, next);
      return { previous, key };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", userId ?? null] });
    },
  });

  const isFavorite = React.useCallback(
    (referenciaId: string, tipo: FavoriteTipo) =>
      (favorites.data ?? []).some(
        (favorite) => favorite.referencia_id === referenciaId && favorite.tipo === tipo
      ),
    [favorites.data]
  );

  const toggle = React.useCallback(
    (referenciaId: string, tipo: FavoriteTipo) => {
      if (!enabled || mutation.isPending) return;
      mutation.mutate({
        referenciaId,
        tipo,
        add: !(favorites.data ?? []).some((f) => f.referencia_id === referenciaId),
      });
    },
    [enabled, mutation, favorites.data]
  );

  return { isFavorite, toggle, isToggling: mutation.isPending };
}
