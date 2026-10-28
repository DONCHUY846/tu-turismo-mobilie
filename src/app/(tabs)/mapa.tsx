import { View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { MapExplorer } from "@/components/map/MapExplorer";

/**
 * Pantalla "Mapa" (pestaña 3): mapa nativo (mapcn-rn + MapLibre/CARTO) con
 * markers de places, restaurants y events; presionar un marker abre el modal
 * de detalle (con favorito) y los chips filtran por tipo de recurso.
 */
export default function Mapa() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader />
      <MapExplorer />
    </View>
  );
}
