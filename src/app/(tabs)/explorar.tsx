import { View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionPlaceholder } from "@/components/SectionPlaceholder";

/**
 * Pantalla "Explorar" (pestaña 2).
 *
 * TODO: cuando existan las pantallas de lugares, eventos y restaurantes, esta
 * pantalla pasa a ser el buscador con filtros (la categoría vive en
 * `usePlacesStore`) y navegará a esas rutas.
 */
export default function Explorar() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader />
      <View className="flex-1 px-4 pt-8">
        <SectionHeader
          align="center"
          title="Explora todo Jalisco"
          subtitle="Busca por categoría, municipio o nombre para encontrar tu próximo destino."
        />
        {/* TODO: buscador con filtros + resultados. */}
        <SectionPlaceholder hint="Buscador y resultados" height={220} />
      </View>
    </View>
  );
}