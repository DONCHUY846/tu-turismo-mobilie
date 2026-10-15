import "../../global.css";

import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { PortalHost } from "@rn-primitives/portal";
import { Stack, ThemeProvider } from "expo-router";
import * as Network from "expo-network";
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
        <NetworkStateSync />
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

/**
 * Le avisa a TanStack Query cuándo hay o no red: sin conexión las consultas se
 * pausan (`networkMode`) y al volver la red se refresca lo que esté vencido.
 */
function NetworkStateSync() {
  React.useEffect(() => {
    const subscription = Network.addNetworkStateListener(({ isConnected }) => {
      onlineManager.setOnline(isConnected !== false);
    });
    return () => subscription.remove();
  }, []);

  return null;
}