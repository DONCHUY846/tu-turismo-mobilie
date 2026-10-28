import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { View } from "react-native";

import { CardSkeleton } from "@/components/CardSkeleton";
import { SectionErrorState } from "@/components/SectionErrorState";
import { Icon } from "@/components/ui/icon";
import { Map, MapControls, MapMarker, type MapInstance } from "@/components/ui/mapcn";
import { Text as UIText } from "@/components/ui/text";
import { useFavoriteToggle } from "@/hooks/useToggleFavorite";
import { fetchEvents, type Event } from "@/services/events";
import type { FavoriteTipo } from "@/services/favorites";
import { fetchPlaces, type Place } from "@/services/places";
import { fetchRestaurants, type Restaurant } from "@/services/restaurants";
import { selectIsAuthenticated, useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { RecursoDetailSheet } from "./RecursoDetailSheet";
import { MapFilterChips, type MapFilter } from "./MapFilterChips";
import { KIND_META, type MapPoint, type MarkerKind } from "./types";

/** tipo de favorito del backend que corresponde a cada kind del mapa */
const TIPO_POR_KIND: Record<MarkerKind, FavoriteTipo> = {
  place: "lugar",
  restaurant: "restaurante",
  event: "evento",
};

/** margen (grados) al calcular los bounds para que ningún pin quede al borde */
const BOUNDS_PADDING = 0.02;

/** Mapa de exploración: places + restaurants + events con modal de detalle y chips de filtro. */
export function MapExplorer() {
  const [selected, setSelected] = React.useState<MapPoint | null>(null);
  /** visible/point van separadas: el contenido no parpadea en la salida */
  const [sheetOpen, setSheetOpen] = React.useState(false);
  /** timeout del cierre; se cancela si se reabre antes de que limpie el punto */
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  /** filtro activo de los chips ("todos" por defecto) */
  const [filter, setFilter] = React.useState<MapFilter>("all");
  /** `true` cuando el mapa terminó de cargar: habilita el re-encuadre por fitBounds */
  const [mapReady, setMapReady] = React.useState(false);
  const mapRef = React.useRef<MapInstance>(null);

  /** error de carga del mapa (tiles/estilo); el reintento remonta el mapa */
  const [mapError, setMapError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const { isFavorite, toggle, isToggling, toggleError } = useFavoriteToggle();

  const placesQuery = useQuery({
    queryKey: ["map", "places"],
    queryFn: () => fetchPlaces({ limit: 100 }),
  });
  const restaurantsQuery = useQuery({
    queryKey: ["map", "restaurants"],
    queryFn: () => fetchRestaurants({ limit: 100 }),
  });
  const eventsQuery = useQuery({
    queryKey: ["map", "events"],
    queryFn: () => fetchEvents({ limit: 100 }),
  });

  const isPending = placesQuery.isPending || restaurantsQuery.isPending || eventsQuery.isPending;
  const allFailed = placesQuery.isError && restaurantsQuery.isError && eventsQuery.isError;

  const points = React.useMemo<MapPoint[]>(() => {
    const placePoints = toPoints(placesQuery.data, "place");
    const restaurantPoints = toPoints(restaurantsQuery.data, "restaurant");
    const eventPoints = toPoints(eventsQuery.data, "event");
    return [...placePoints, ...restaurantPoints, ...eventPoints];
  }, [placesQuery.data, restaurantsQuery.data, eventsQuery.data]);

  /** pins visibles según el filtro activo (client-side sobre la caché) */
  const filteredPoints = React.useMemo<MapPoint[]>(
    () => (filter === "all" ? points : points.filter((point) => point.kind === filter)),
    [filter, points]
  );

  /** conteo por filtro para las píldoras */
  const counts = React.useMemo<Record<MapFilter, number>>(
    () => ({
      all: points.length,
      place: points.filter((point) => point.kind === "place").length,
      restaurant: points.filter((point) => point.kind === "restaurant").length,
      event: points.filter((point) => point.kind === "event").length,
    }),
    [points]
  );

  /** bounds inicial que abarca todos los pins (evita cámara fija en el centro). */
  const bounds = React.useMemo(() => boundsFrom(points), [points]);

  const retryAll = () => {
    placesQuery.refetch();
    restaurantsQuery.refetch();
    eventsQuery.refetch();
  };

  /** abre el sheet con un punto, cancelando un cierre aún pendiente de limpiar */
  const openPoint = (point: MapPoint) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setSelected(point);
    setSheetOpen(true);
  };

  /** cierra el sheet y limpia el punto cuando la salida terminó (~300ms nativo) */
  const closeSheet = () => {
    setSheetOpen(false);
    closeTimer.current = setTimeout(() => {
      setSelected(null);
      closeTimer.current = null;
    }, 400);
  };

  // el temporizador no debe sobrevivir al componente
  React.useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Re-encuadre animado: al cambiar el filtro (o al terminar de cargar el
  // mapa) la cámara vuela a los pins visibles. Si el filtro queda sin pins
  // con coordenadas NO se mueve: aparece la tarjeta de vacío (Review Focus 5).
  React.useEffect(() => {
    if (!mapReady) return;
    const nextBounds = boundsFrom(filteredPoints);
    if (!nextBounds) return;
    mapRef.current?.fitBounds(nextBounds, { duration: 600, easing: "fly" });
  }, [filter, mapReady, filteredPoints]);

  if (isPending) {
    return (
      <View className="flex-1 justify-center px-4 pb-4">
        {/* el "mapa" es el bloque de imagen del skeleton; sin botón "Ver más" */}
        <CardSkeleton imageHeight={340} rows={2} action={false} className="flex-1" />
      </View>
    );
  }

  if (allFailed) {
    return (
      <View className="flex-1 justify-center px-4 pb-4">
        <SectionErrorState onRetry={retryAll} />
      </View>
    );
  }

  if (points.length === 0) {
    return (
      <View className="flex-1 justify-center px-4 pb-4">
        <View className="items-center gap-2 rounded-2xl border border-border bg-card px-4 py-8">
          <UIText className="text-center text-sm font-semibold text-foreground">
            Aún no hay lugares con ubicación
          </UIText>
          <UIText className="text-center text-xs text-muted-foreground">
            Cuando los lugares, restaurantes o eventos tengan coordenadas, aparecerán aquí.
          </UIText>
        </View>
      </View>
    );
  }

  if (mapError) {
    return (
      <View className="flex-1 justify-center px-4 pb-4">
        <SectionErrorState
          title="El mapa no pudo cargar"
          detail={mapError}
          onRetry={() => {
            setMapError(null);
            setReloadKey((key) => key + 1);
            // el remonte dispara onLoad de nuevo y re-encuadra al filtro activo
            setMapReady(false);
          }}
        />
      </View>
    );
  }

  /** texto de la tarjeta cuando el filtro activo no tiene pins con coordenadas */
  const emptyLabel = filter === "all" ? "recursos" : KIND_META[filter].label.toLowerCase();

  return (
    <View className="flex-1">
      <MapFilterChips value={filter} onChange={setFilter} counts={counts} />

      <Map
        // sin `style`: el provider CARTO resuelve Voyager (claro) / Dark Matter (oscuro).
        // Hoy el app no tiene paleta oscura (TODO en global.css), así que el mapa
        // se fija en claro para no mezclar tiles oscuros con UI clara. Al soportar
        // dark mode, quitar este pin y el basemap alterna solo.
        key={reloadKey}
        colorScheme="light"
        bounds={bounds}
        attribution={{ position: "bottom-left" }}
        ref={mapRef}
        onLoad={() => setMapReady(true)}
        onError={(error) => {
          setSelected(null);
          setSheetOpen(false);
          setMapError(error.message);
        }}
      >
        {filteredPoints.map((point) => (
          <MapMarker key={`${point.kind}-${point.id}`} coordinate={point.coordinate} onPress={() => openPoint(point)}>
            <MarkerBubble kind={point.kind} />
          </MapMarker>
        ))}

        <MapControls position="bottom-right" showZoom showLocate />
      </Map>

      {/* Filtro sin pins con coordenadas: la cámara no se mueve, se avisa aquí.
          Va hermana del Map (los children del Map son anotaciones nativas). */}
      {filteredPoints.length === 0 ? (
        <View className="absolute bottom-24 left-4 right-24 rounded-2xl border border-border bg-card px-4 py-3 shadow-md">
          <UIText className="text-xs text-muted-foreground">
            No hay {emptyLabel} con ubicación en el mapa.
          </UIText>
        </View>
      ) : null}

      <RecursoDetailSheet
        point={selected}
        visible={sheetOpen}
        onClose={closeSheet}
        canFavorite={isAuthenticated}
        isFavorite={selected ? isFavorite(selected.id, TIPO_POR_KIND[selected.kind]) : false}
        onToggleFavorite={() => {
          if (selected) toggle(selected.id, TIPO_POR_KIND[selected.kind]);
        }}
        isToggling={isToggling}
        toggleError={toggleError}
      />
    </View>
  );
}

/** Burbuja circular del marker: color e ícono por tipo de recurso. */
function MarkerBubble({ kind }: { kind: MarkerKind }) {
  const meta = KIND_META[kind];
  return (
    <View
      className={cn("h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md", meta.container)}
      style={{ elevation: 4 }}
    >
      <Icon as={meta.icon} size={14} className="text-white" />
    </View>
  );
}

/**
 * Bounds que abarcan todos los pins de la lista (`undefined` si está vacía).
 * Mismo padding que el encuadre inicial para que ningún pin quede al borde.
 */
function boundsFrom(list: MapPoint[]): [number, number, number, number] | undefined {
  if (list.length === 0) return undefined;
  const lngs = list.map((point) => point.coordinate[0]);
  const lats = list.map((point) => point.coordinate[1]);
  return [
    Math.min(...lngs) - BOUNDS_PADDING,
    Math.min(...lats) - BOUNDS_PADDING,
    Math.max(...lngs) + BOUNDS_PADDING,
    Math.max(...lats) + BOUNDS_PADDING,
  ];
}

/**
 * Convierte una lista de la API en puntos de mapa. Filtra lo que el plan
 * exige: sin coordenadas o inactivo no se muestra (nunca se asume lat/lng).
 */
function toPoints<T extends Place | Restaurant | Event>(
  items: T[] | undefined,
  kind: MarkerKind,
): MapPoint[] {
  if (!items) return [];
  return items.flatMap((item) => {
    if (!item.coordenadas || item.activo === false) return [];
    return [
      {
        id: item.id,
        kind,
        coordinate: [item.coordenadas.lng, item.coordenadas.lat],
        item,
      },
    ];
  });
}
