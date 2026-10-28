import { View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { MapExplorer } from "@/components/map/MapExplorer";

/**
 * Pantalla "Mapa" (pestaña 3): mapa nativo (mapcn-rn + MapLibre/CARTO) con
 * markers de places, restaurants y events. TODO: al existir las rutas de
 * detalle, el popup agrega el botón "Ver detalle".
 */
export default function Mapa() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader />
      <MapExplorer />
    </View>
  );
}
