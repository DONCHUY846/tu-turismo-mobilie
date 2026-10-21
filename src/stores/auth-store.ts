import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { RefreshResponse } from "@/lib/auth-refresh";
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
  /**
   * `true` cuando la sesión se venció sola (el refresh token también dejó de
   * servir) y hay que volver a iniciar sesión. No se persiste: al arrancar en
   * frío la app debe poder abrirse como invitado.
   */
  sessionExpired: boolean;
  signIn: (response: LoginResponse) => void;
  signOut: () => void;
  /** pasa de "loading" a "authenticated"/"guest" al terminar de rehidratar */
  setStatus: (status: AuthStatus) => void;
  /** aplica la respuesta de `/core/auth/refresh/` */
  applyRefresh: (response: RefreshResponse) => void;
  /** cierra la sesión porque el refresh token dejó de servir */
  expireSession: () => void;
  clearSessionExpired: () => void;
  /** actualiza los datos del usuario en memoria (tras editar el perfil) */
  updateUser: (user: Partial<AuthUser>) => void;
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
      sessionExpired: false,
      signIn: ({ access_token, refresh_token, expires_in, user }) =>
        set({
          status: "authenticated",
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: Date.now() + expires_in * 1000,
          user,
          sessionExpired: false,
        }),
      signOut: () =>
        set({ ...EMPTY_SESSION, status: "guest", sessionExpired: false }),
      setStatus: (status) => set({ status }),
      applyRefresh: ({ access_token, refresh_token, expires_in, user }) =>
        set((state) => ({
          status: "authenticated",
          accessToken: access_token,
          // el backend puede no rotar el refresh token: si no viene, se conserva
          refreshToken: refresh_token ?? state.refreshToken,
          // `0` = expiración desconocida: el transporte solo refresca de forma
          // preventiva cuando la conoce.
          expiresAt: expires_in > 0 ? Date.now() + expires_in * 1000 : 0,
          user: user ? { ...state.user, ...user } : state.user,
        })),
      expireSession: () =>
        set({ ...EMPTY_SESSION, status: "guest", sessionExpired: true }),
      clearSessionExpired: () => set({ sessionExpired: false }),
      updateUser: (user) =>
        set((state) => ({ user: { ...state.user, ...user } })),
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