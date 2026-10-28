import "../../global.css";

import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { PortalHost } from "@rn-primitives/portal";
import { Stack, ThemeProvider, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Network from "expo-network";
import * as React from "react";

import { NAV_THEME } from "@/lib/theme";
import { useAuthStore } from "@/stores/auth-store";

// El splash se oculta desde `SplashController`, cuando ya sabemos si hay sesión
// y las fuentes están listas.
SplashScreen.preventAutoHideAsync();

/** Ruta a la que vuelve el router cuando un guard redirige (p. ej. tras logout). */
export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <ThemeProvider value={NAV_THEME}>
      <AppGate />
    </ThemeProvider>
  );
}

function AppGate() {
  const status = useAuthStore((state) => state.status);

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
    <QueryClientProvider client={queryClient}>
      <NetworkStateSync />
      <SessionExpiryWatcher />
      <SplashController />
      <Stack
        screenOptions={{
          // Cada pantalla dibuja su propio header o ninguno (login).
          headerShown: false,
        }}
      >
        {/* Pestañas de la app: Inicio, Explorar y Perfil. */}
        <Stack.Screen name="(tabs)" />
        {/* Rutas privadas: necesitan sesión (ver `(app)/_layout.tsx`). */}
        <Stack.Screen name="(app)" />
        {/* Con sesión activa el login no existe: el router vuelve al `anchor`. */}
        <Stack.Protected guard={status === "guest"}>
          <Stack.Screen name="login" />
          <Stack.Screen name="registro" />
          <Stack.Screen name="recuperar-contrasena" />
        </Stack.Protected>
      </Stack>
      {/* Requerido por los componentes overlay de react-native-reusables (dialog, popover, etc.). */}
      <PortalHost />
    </QueryClientProvider>
  );
}

/**
 * Avisa al usuario cuando su sesión se venció sola (el refresh token dejó de
 * servir) y lo manda al login con el motivo, para que no entre sin querer.
 */
function SessionExpiryWatcher() {
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const clearSessionExpired = useAuthStore((state) => state.clearSessionExpired);

  React.useEffect(() => {
    if (!sessionExpired) return;
    clearSessionExpired();
    router.replace({ pathname: "/login", params: { reason: "expired" } });
  }, [sessionExpired, clearSessionExpired]);

  return null;
}

/**
 * Mantiene el splash visible hasta que la sesión se haya rehidratado de
 * SecureStore (store de auth en estado "loading").
 */
function SplashController() {
  const status = useAuthStore((state) => state.status);

  React.useEffect(() => {
    if (status !== "loading") void SplashScreen.hideAsync();
  }, [status]);

  return null;
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