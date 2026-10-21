import { Stack } from "expo-router";
import * as React from "react";

import { useAuthStore } from "@/stores/auth-store";

/**
 * Rutas privadas de la app (las que necesitan sesión).
 *
 * El grupo no aparece en la URL: `src/app/(app)/editar-perfil.tsx` se
 * alcanza en `/editar-perfil`.
 */
export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.status === "authenticated");

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="editar-perfil" />
      </Stack.Protected>
    </Stack>
  );
}
