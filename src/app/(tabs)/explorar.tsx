import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { MapExplorer } from "@/components/map/MapExplorer";
import type { MarkerKind } from "@/components/map/types";

/**
 * Pantalla "Explorar" (pestaña 2): mapa nativo (mapcn-rn + MapLibre/CARTO) con
 * markers de places, restaurants y events; presionar un marker abre el modal
 * de detalle (con favorito) y los chips filtran por tipo de recurso.
 *
 * Las tarjetas de Inicio abren esta pestaña con `kind` e `id` para encuadrar y
 * seleccionar el recurso.
 */
export default function Explorar() {
  const { kind, id } = useLocalSearchParams<{ kind?: string; id?: string }>();

  const initialSelection =
    kind && id && (kind === "place" || kind === "restaurant" || kind === "event")
      ? { kind: kind as MarkerKind, id }
      : undefined;

  return (
    <View className="flex-1 bg-background">
      <AppHeader />
      <MapExplorer initialSelection={initialSelection} />
    </View>
  );
}
