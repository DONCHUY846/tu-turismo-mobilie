import "../../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PortalHost } from "@rn-primitives/portal";
import { Stack, ThemeProvider } from "expo-router";
import * as React from "react";

import { NAV_THEME } from "@/lib/theme";

export default function RootLayout() {
  // Un cliente por montaje del layout: se crea fuera del render para no
  // reiniciar la caché de TanStack Query en cada re-render.
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 2,
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <ThemeProvider value={NAV_THEME}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            // Cada pantalla dibuja su propio header (AppHeader).
            headerShown: false,
          }}
        />
        {/* Requerido por los componentes overlay de react-native-reusables (dialog, popover, etc.). */}
        <PortalHost />
      </QueryClientProvider>
    </ThemeProvider>
  );
}