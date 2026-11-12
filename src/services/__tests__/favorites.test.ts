import { apiFetch, apiRequest } from "@/lib/api";
import {
  createFavorite,
  deleteFavorite,
  favoriteIds,
  fetchFavorites,
  type Favorite,
} from "@/services/favorites";

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
  apiRequest: jest.fn(),
}));

const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;
const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;

const favorites: Favorite[] = [
  {
    id: "fav-1",
    user_id: "user-1",
    tipo: "lugar",
    referencia_id: "place-1",
    created_at: "2026-08-10 17:50:36.275000",
  },
  {
    id: "fav-2",
    user_id: "user-1",
    tipo: "evento",
    referencia_id: "event-1",
    created_at: "2026-08-11 10:00:00",
  },
  {
    id: "fav-3",
    user_id: "user-1",
    tipo: "lugar",
    referencia_id: "place-2",
    created_at: "2026-08-12 10:00:00",
  },
];

describe("favoriteIds", () => {
  it("filtra por tipo y conserva el orden de la API", () => {
    expect(favoriteIds(favorites, "lugar")).toEqual(["place-1", "place-2"]);
    expect(favoriteIds(favorites, "evento")).toEqual(["event-1"]);
    expect(favoriteIds(favorites, "restaurante")).toEqual([]);
  });
});

describe("servicio de favoritos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchFavorites pide la lista al endpoint correcto", async () => {
    apiFetchMock.mockResolvedValueOnce(favorites);

    await expect(fetchFavorites()).resolves.toBe(favorites);
    expect(apiFetchMock).toHaveBeenCalledWith("/core/favorites/");
  });

  it("createFavorite manda tipo y referencia_id", async () => {
    apiFetchMock.mockResolvedValueOnce(favorites[0]);

    await createFavorite({ tipo: "lugar", referenciaId: "place-1" });

    expect(apiFetchMock).toHaveBeenCalledWith("/core/favorites/", {
      method: "POST",
      body: JSON.stringify({ tipo: "lugar", referencia_id: "place-1" }),
    });
  });

  it("deleteFavorite usa el referencia_id en la URL", async () => {
    apiRequestMock.mockResolvedValueOnce({ success: true });

    await deleteFavorite("place-1");

    expect(apiRequestMock).toHaveBeenCalledWith("/core/favorites/place-1/", {
      method: "DELETE",
    });
  });
});
