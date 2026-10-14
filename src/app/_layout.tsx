import "../../global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Stack, ThemeProvider } from "expo-router";

import { NAV_THEME } from "@/lib/theme";

export default function RootLayout() {
  return (
    <ThemeProvider value={NAV_THEME}>
      <Stack
        screenOptions={{
          // Cada pantalla dibuja su propio header (AppHeader).
          headerShown: false,
        }}
      />
      {/* Requerido por los componentes overlay de react-native-reusables (dialog, popover, etc.). */}
      <PortalHost />
    </ThemeProvider>
  );
}