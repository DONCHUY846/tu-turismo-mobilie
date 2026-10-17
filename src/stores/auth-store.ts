import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthUser, LoginResponse } from "@/services/auth";

/**
 * Estado de la sesión: qué usuario está dentro y con qué tokens.
 *
 * Se persiste con `expo-secure-store` (Keychain en iOS, Keystore en Android)
 * mediante un adaptador de almacenamiento compatible con Zustand.
 */

export type AuthStatus = "loading" | "authenticated" | "guest";

type Session = {
  accessToken: string;
  refreshToken: string;
  /** timestamp (ms) en que expira el access token */
  expiresAt: number;
  user: AuthUser;
};

type AuthStore = Session & {
  status: AuthStatus;
  signIn: (response: LoginResponse) => void;
  signOut: () => void;
  /** pasa de "loading" a "authenticated"/"guest" al terminar de rehidratar */
  setStatus: (status: AuthStatus) => void;
};

const STORAGE_KEY = "tu-turismo.auth.session";

/** Adaptador de `expo-secure-store` para `zustand/middleware`. */
const secureStorage = createJSONStorage<Session>(() => ({
  getItem: async (key) => (await SecureStore.getItemAsync(key)) ?? null,
  setItem: async (key, value) => {
    // SecureStore guarda strings; el middleware ya serializa a JSON.
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
}));

const EMPTY_SESSION: Session = {
  accessToken: "",
  refreshToken: "",
  expiresAt: 0,
  user: { id: "", email: "", rol: "turista", nombre: "" },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...EMPTY_SESSION,
      // Inicial: el splash se mantiene hasta que termine la rehidratación.
      status: "loading",
      signIn: ({ access_token, refresh_token, expires_in, user }) =>
        set({
          status: "authenticated",
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: Date.now() + expires_in * 1000,
          user,
        }),
      signOut: () => set({ ...EMPTY_SESSION, status: "guest" }),
      setStatus: (status) => set({ status }),
    }),
    {
      name: STORAGE_KEY,
      storage: secureStorage,
      // Solo la sesión viaja a SecureStore; `status` se recalcula al arrancar.
      partialize: ({ accessToken, refreshToken, expiresAt, user }) => ({
        accessToken,
        refreshToken,
        expiresAt,
        user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setStatus(state.accessToken ? "authenticated" : "guest");
      },
    }
  )
);

/** Booleano para los guards de navegación y los `if` de la UI. */
export const selectIsAuthenticated = (state: AuthStore) => state.status === "authenticated";