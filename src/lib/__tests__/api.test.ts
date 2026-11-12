import { ApiError, API_URL, apiFetch, apiRequest } from "@/lib/api";
import { requestRefresh } from "@/lib/auth-refresh";
import { useAuthStore } from "@/stores/auth-store";

jest.mock("@/lib/auth-refresh", () => ({
  requestRefresh: jest.fn(),
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

type MockState = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  applyRefresh: jest.Mock;
  expireSession: jest.Mock;
};

const requestRefreshMock = requestRefresh as jest.MockedFunction<typeof requestRefresh>;
const getStateMock = useAuthStore.getState as jest.Mock;

let state: MockState;
let fetchMock: jest.Mock;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  state = {
    accessToken: "old-access",
    refreshToken: "old-refresh",
    expiresAt: Date.now() + 60 * 60 * 1000,
    applyRefresh: jest.fn((response: { access_token: string; expires_in: number }) => {
      state.accessToken = response.access_token;
      state.expiresAt = Date.now() + response.expires_in * 1000;
    }),
    expireSession: jest.fn(),
  };
  getStateMock.mockImplementation(() => state);

  fetchMock = jest.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  requestRefreshMock.mockReset();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("apiFetch", () => {
  it("desenvuelve el sobre { success, data }", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { id: "1" } }));

    await expect(apiFetch<{ id: string }>("/core/places/")).resolves.toEqual({ id: "1" });
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/core/places/`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer old-access" }),
      })
    );
  });

  it("apiRequest devuelve el JSON completo, sin desenvolver", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: "1" }, message: "ok" })
    );

    await expect(apiRequest("/core/places/")).resolves.toEqual({
      success: true,
      data: { id: "1" },
      message: "ok",
    });
  });
});

describe("renovación de sesión", () => {
  it("ante un 401 refresca una vez y reintenta una vez", async () => {
    requestRefreshMock.mockResolvedValueOnce({
      access_token: "new-access",
      expires_in: 3600,
    });
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ detail: "Token expirado" }, 401))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: "1" } }));

    await expect(apiFetch("/core/places/")).resolves.toEqual({ id: "1" });

    expect(requestRefreshMock).toHaveBeenCalledTimes(1);
    expect(requestRefreshMock).toHaveBeenCalledWith("old-refresh");
    expect(state.applyRefresh).toHaveBeenCalledWith({
      access_token: "new-access",
      expires_in: 3600,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer new-access");
  });

  it("varias peticiones con 401 comparten un solo refresh", async () => {
    let resolveRefresh: (value: { access_token: string; expires_in: number }) => void = () => {};
    requestRefreshMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      })
    );
    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const headers = init.headers as Record<string, string>;
      if (headers.Authorization === "Bearer new-access") {
        return jsonResponse({ success: true, data: {} });
      }
      return jsonResponse({ detail: "Token expirado" }, 401);
    });

    const first = apiRequest("/core/a/");
    const second = apiRequest("/core/b/");

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(requestRefreshMock).toHaveBeenCalledTimes(1);

    resolveRefresh({ access_token: "new-access", expires_in: 3600 });
    await Promise.all([first, second]);

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("refresca de forma preventiva si el token vence en menos de 2 minutos", async () => {
    state.expiresAt = Date.now() + 60 * 1000;
    requestRefreshMock.mockResolvedValueOnce({
      access_token: "new-access",
      expires_in: 3600,
    });
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: {} }));

    await apiRequest("/core/places/");

    expect(requestRefreshMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer new-access");
  });

  it("si el refresh token también murió, cierra la sesión y conserva el error 401", async () => {
    requestRefreshMock.mockResolvedValueOnce(null);
    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "Token expirado" }, 401));

    await expect(apiRequest("/core/places/")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      detail: "Token expirado",
    });
    expect(state.expireSession).toHaveBeenCalledTimes(1);
  });
});

describe("cuerpo y errores", () => {
  it("no fuerza Content-Type JSON cuando el body es FormData", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: {} }));
    const body = new FormData();
    body.append("file", "contenido");

    await apiRequest("/core/upload/", { method: "POST", body });

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
    expect(headers.Accept).toBe("application/json");
  });

  it("conserva status y detail del backend", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ detail: "El email ya está registrado." }, 400)
    );

    await expect(apiRequest("/core/auth/register/")).rejects.toEqual(
      new ApiError("El email ya está registrado.", 400, "El email ya está registrado.")
    );
  });
});
