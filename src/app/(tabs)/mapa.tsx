import { View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionPlaceholder } from "@/components/SectionPlaceholder";

/**
 * Pantalla "Mapa" (pestaña 3).
 *
 * TODO (Task 4): reemplazar el placeholder por `MapExplorer` — mapa nativo
 * (mapcn-rn + MapLibre/CARTO) con markers de places, restaurants y events.
 */
export default function Mapa() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader />
      <View className="flex-1 px-4 pt-8">
        <SectionHeader
          align="center"
          title="Mapa de Jalisco"
          subtitle="Encuentra lugares, restaurantes y eventos cerca de ti."
        />
        {/* TODO: MapExplorer (mapcn-rn + MapLibre). */}
        <SectionPlaceholder hint="Mapa de exploración" height={220} />
      </View>
    </View>
  );
}
