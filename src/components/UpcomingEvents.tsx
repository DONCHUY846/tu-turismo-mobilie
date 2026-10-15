import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { View } from "react-native";

import { CardSkeleton } from "@/components/CardSkeleton";
import { EventCard } from "@/components/EventCard";
import { SectionErrorState } from "@/components/SectionErrorState";
import { SectionHeader } from "@/components/SectionHeader";
import { Text } from "@/components/ui/text";
import { sortByDateAsc } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fetchEvents } from "@/services/events";

export type UpcomingEventsProps = {
  /** cuántos eventos mostrar */
  limit?: number;
};

/**
 * Sección "Próximos Eventos" de la home.
 *
 * La API no soporta `ordering`, así que el orden por fecha (la más cercana
 * primero) se resuelve en el cliente. Nota: hoy todos los eventos del backend
 * tienen fechas ya pasadas; no se filtran para que la sección nunca salga vacía.
 */
export function UpcomingEvents({ limit = 4 }: UpcomingEventsProps) {
  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["events", { limit }],
    queryFn: () => fetchEvents({ limit }),
  });

  const events = React.useMemo(
    () => (data ? sortByDateAsc(data, (event) => event.fecha_inicio).slice(0, limit) : []),
    [data, limit]
  );

  return (
    <View>
      <SectionHeader
        title="Próximos Eventos"
        subtitle="No te pierdas de las actividades locales"
        action={
          events.length > 0
            ? {
                label: "Ver todos los eventos",
                // TODO: navegar a la pantalla /eventos cuando exista.
                onPress: () => {},
              }
            : undefined
        }
      />

      {isPending ? (
        <View className="gap-4">
          {Array.from({ length: limit }, (_, index) => (
            <CardSkeleton key={index} rows={1} action={false} />
          ))}
        </View>
      ) : null}

      {isError ? (
        <SectionErrorState
          title="No pudimos cargar los eventos"
          detail={error?.message ?? "Revisa tu conexión e inténtalo de nuevo."}
          onRetry={() => void refetch()}
        />
      ) : null}

      {events.length > 0 ? (
        <View className={cn("gap-4", isRefetching && "opacity-60")}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>
      ) : null}

      {!isPending && !isError && events.length === 0 ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">
          Todavía no hay eventos publicados.
        </Text>
      ) : null}
    </View>
  );
}