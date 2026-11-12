import { useAuthStore } from "@/stores/auth-store";

const EMPTY_USER = {
  id: "",
  email: "",
  rol: "turista" as const,
  nombre: "",
};

function resetStore() {
  useAuthStore.setState({
    status: "guest",
    accessToken: "",
    refreshToken: "",
    expiresAt: 0,
    user: EMPTY_USER,
    sessionExpired: false,
  });
}

beforeEach(resetStore);

describe("auth-store", () => {
  it("signIn guarda la sesión y marca al usuario como autenticado", () => {
    const before = Date.now();

    useAuthStore.getState().signIn({
      access_token: "access-1",
      refresh_token: "refresh-1",
      token_type: "Bearer",
      expires_in: 3600,
      user: {
        id: "user-1",
        email: "user@example.com",
        rol: "turista",
        nombre: "Jesús",
      },
    });

    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.accessToken).toBe("access-1");
    expect(state.refreshToken).toBe("refresh-1");
    expect(state.expiresAt).toBeGreaterThanOrEqual(before + 3600 * 1000);
    expect(state.user.nombre).toBe("Jesús");
    expect(state.sessionExpired).toBe(false);
  });

  it("signOut limpia la sesión y deja al usuario como invitado", () => {
    useAuthStore.getState().signIn({
      access_token: "access-1",
      refresh_token: "refresh-1",
      token_type: "Bearer",
      expires_in: 3600,
      user: {
        id: "user-1",
        email: "user@example.com",
        rol: "turista",
        nombre: "Jesús",
      },
    });

    useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.status).toBe("guest");
    expect(state.accessToken).toBe("");
    expect(state.refreshToken).toBe("");
    expect(state.user).toEqual(EMPTY_USER);
    expect(state.sessionExpired).toBe(false);
  });

  it("applyRefresh conserva el refresh token y el usuario si no vienen en la respuesta", () => {
    useAuthStore.getState().signIn({
      access_token: "access-1",
      refresh_token: "refresh-1",
      token_type: "Bearer",
      expires_in: 3600,
      user: {
        id: "user-1",
        email: "user@example.com",
        rol: "turista",
        nombre: "Jesús",
      },
    });

    useAuthStore.getState().applyRefresh({
      access_token: "access-2",
      expires_in: 1800,
    });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("access-2");
    expect(state.refreshToken).toBe("refresh-1");
    expect(state.user.nombre).toBe("Jesús");
    expect(state.expiresAt).toBeGreaterThan(Date.now());
  });

  it("applyRefresh actualiza el usuario cuando la respuesta lo incluye", () => {
    useAuthStore.getState().signIn({
      access_token: "access-1",
      refresh_token: "refresh-1",
      token_type: "Bearer",
      expires_in: 3600,
      user: {
        id: "user-1",
        email: "user@example.com",
        rol: "turista",
        nombre: "Jesús",
      },
    });

    useAuthStore.getState().applyRefresh({
      access_token: "access-2",
      expires_in: 1800,
      user: {
        id: "user-1",
        email: "nuevo@example.com",
        rol: "turista",
        nombre: "Jesús A.",
      },
    });

    expect(useAuthStore.getState().user).toMatchObject({
      email: "nuevo@example.com",
      nombre: "Jesús A.",
    });
  });

  it("expireSession cierra la sesión y levanta la bandera de expiración", () => {
    useAuthStore.getState().expireSession();

    const state = useAuthStore.getState();
    expect(state.status).toBe("guest");
    expect(state.sessionExpired).toBe(true);
    expect(state.accessToken).toBe("");
  });

  it("updateUser fusiona campos sin borrar los existentes", () => {
    useAuthStore.getState().updateUser({
      id: "user-1",
      email: "user@example.com",
      nombre: "Jesús",
    });

    useAuthStore.getState().updateUser({ nombre: "Jesús A." });

    expect(useAuthStore.getState().user).toMatchObject({
      id: "user-1",
      email: "user@example.com",
      nombre: "Jesús A.",
    });
  });
});
