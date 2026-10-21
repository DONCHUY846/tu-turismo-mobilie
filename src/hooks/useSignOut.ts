import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as React from "react";

import { useAuthStore } from "@/stores/auth-store";

/**
 * Cierra la sesión del usuario.
 *
 * Son tres cosas, en este orden:
 *  1. `signOut()` borra los tokens del dispositivo (SecureStore).
 *  2. `queryClient.clear()` borra la caché de TanStack Query: si no, al entrar
 *     con otra cuenta se podrían ver los datos del usuario anterior (el perfil
 *     vive en la query `["profile"]`, que no incluye al usuario).
 *  3. Se vuelve a Inicio, ya como invitado.
 *
 * El backend no tiene endpoint de logout, así que el cierre es local: el
 * refresh token sigue vivo en el servidor hasta que expira, pero desaparece del
 * dispositivo.
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const signOut = useAuthStore((state) => state.signOut);
  const router = useRouter();

  return React.useCallback(async () => {
    signOut();
    // Las peticiones en vuelo se descartan para que no repinten datos de la
    // sesión que ya terminó.
    await queryClient.cancelQueries();
    queryClient.clear();
    // `navigate` y no `replace`: dentro del navigator de pestañas solo cambia
    // de pestaña, sin duplicar la entrada `(tabs)` en el stack raíz.
    router.navigate("/");
  }, [queryClient, router, signOut]);
}
