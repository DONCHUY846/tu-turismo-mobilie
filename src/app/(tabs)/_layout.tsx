import { Tabs } from "expo-router";

import { AppTabBar } from "@/components/navigation/AppTabBar";

/**
 * Navegación inferior de la app (Inicio / Explorar / Perfil).
 * El contenido de las pestañas vive en los archivos vecinos; el login queda
 * fuera de este grupo, en el Stack raíz.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // Las pantallas dibujan su propio header (AppHeader); el header de las
        // tabs solo mostraría el nombre de la pestaña activa.
        headerShown: false,
      }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="explorar" options={{ title: "Explorar" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}