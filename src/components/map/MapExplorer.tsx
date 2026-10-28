import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Utensils, type LucideIcon } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { CardSkeleton } from "@/components/CardSkeleton";
import { SectionErrorState } from "@/components/SectionErrorState";
import { Icon } from "@/components/ui/icon";
import { Map, MapControls, MapMarker, MapPopup } from "@/components/ui/mapcn";
import { Text as UIText } from "@/components/ui/text";
import { formatDateRange } from "@/lib/format";
import { fetchEvents } from "@/services/events";
import { fetchPlaces } from "@/services/places";
import { fetchRestaurants } from "@/services/restaurants";
import { cn } from "@/lib/utils";

/** Tipos de recurso que el mapa muestra (misma terna que la web). */
type MarkerKind = "place" | "restaurant" | "event";

/** Un pin del mapa, normalizado entre los tres recursos. */
type MapPoint = {
  id: string;
  kind: MarkerKind;
  nombre: string;
  municipio: string;
  categoria: string;
  /** solo eventos: rango de fechas ya formateado */
  fecha?: string;
  /** [lng, lat] */
  coordinate: [number, number];
};

const KIND_META: Record<MarkerKind, { container: string; icon: LucideIcon }> = {
  place: { container: "bg-blue-500", icon: MapPin },
  restaurant: { container: "bg-amber-500", icon: Utensils },
  event: { container: "bg-violet-500", icon: CalendarDays },
};

/** margen (grados) al calcular los bounds para que ningún pin quede al borde */
const BOUNDS_PADDING = 0.02;

/** Mapa de exploración: places + restaurants + events como markers con popup. */
export function MapExplorer() {
  const [selected, setSelected] = React.useState<MapPoint | null>(null);
  /** error de carga del mapa (tiles/estilo); el reintento remonta el mapa */
  const [mapError, setMapError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

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
    const placePoints = toPoints(placesQuery.data, "place", (item) => ({
      fecha: undefined,
    }));
    const restaurantPoints = toPoints(restaurantsQuery.data, "restaurant", () => ({
      fecha: undefined,
    }));
    const eventPoints = toPoints(eventsQuery.data, "event", (item) => ({
      fecha: formatDateRange(item.fecha_inicio, item.fecha_fin || undefined),
    }));
    return [...placePoints, ...restaurantPoints, ...eventPoints];
  }, [placesQuery.data, restaurantsQuery.data, eventsQuery.data]);

  /** bounds inicial que abarca todos los pins (evita cámara fija en el centro). */
  const bounds = React.useMemo<[number, number, number, number] | undefined>(() => {
    if (points.length === 0) return undefined;
    const lngs = points.map((point) => point.coordinate[0]);
    const lats = points.map((point) => point.coordinate[1]);
    return [
      Math.min(...lngs) - BOUNDS_PADDING,
      Math.min(...lats) - BOUNDS_PADDING,
      Math.max(...lngs) + BOUNDS_PADDING,
      Math.max(...lats) + BOUNDS_PADDING,
    ];
  }, [points]);

  const retryAll = () => {
    placesQuery.refetch();
    restaurantsQuery.refetch();
    eventsQuery.refetch();
  };

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
          }}
        />
      </View>
    );
  }

  return (
    <Map
      // sin `style`: el provider CARTO resuelve Voyager (claro) / Dark Matter (oscuro).
      // Hoy el app no tiene paleta oscura (TODO en global.css), así que el mapa
      // se fija en claro para no mezclar tiles oscuros con UI clara. Al soportar
      // dark mode, quitar este pin y el basemap alterna solo.
      key={reloadKey}
      colorScheme="light"
      bounds={bounds}
      attribution={{ position: "bottom-left" }}
      onError={(error) => {
        setSelected(null);
        setMapError(error.message);
      }}
    >
      {points.map((point) => (
        <MapMarker key={`${point.kind}-${point.id}`} coordinate={point.coordinate} onPress={() => setSelected(point)}>
          <MarkerBubble kind={point.kind} />
        </MapMarker>
      ))}

      {/* Popup hermano del marker (patrón documentado): coordenada explícita. */}
      {selected ? (
        <MapPopup coordinate={selected.coordinate} visible onClose={() => setSelected(null)}>
          <View className="gap-y-1 pr-4">
            <UIText className="text-sm font-semibold text-foreground">{selected.nombre}</UIText>
            <UIText className="text-xs text-muted-foreground">{selected.municipio}</UIText>
            {selected.categoria ? (
              <UIText className="text-[10px] font-semibold text-brand-cyan">{selected.categoria}</UIText>
            ) : null}
            {selected.fecha ? <UIText className="text-xs text-muted-foreground">{selected.fecha}</UIText> : null}
          </View>
        </MapPopup>
      ) : null}

      <MapControls position="bottom-right" showZoom showLocate />
    </Map>
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
 * Convierte una lista de la API en puntos de mapa. Filtra lo que el plan
 * exige: sin coordenadas o inactivo no se muestra (nunca se asume lat/lng).
 */
function toPoints<T extends { id: string; nombre: string; municipio: string; categoria: string; activo: boolean; coordenadas: { lng: number; lat: number } | null }>(
  items: T[] | undefined,
  kind: MarkerKind,
  extra: (item: T) => { fecha?: string },
): MapPoint[] {
  if (!items) return [];
  return items.flatMap((item) => {
    if (!item.coordenadas || item.activo === false) return [];
    const fecha = extra(item).fecha;
    return [
      {
        id: item.id,
        kind,
        nombre: item.nombre,
        municipio: item.municipio,
        categoria: item.categoria,
        ...(fecha ? { fecha } : {}),
        coordinate: [item.coordenadas.lng, item.coordenadas.lat],
      },
    ];
  });
}
