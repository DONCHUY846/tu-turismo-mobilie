import { create } from "zustand";

type PlacesFilters = {
  /** categoría activa; vacía = todas */
  categoria: string;
  /** texto de búsqueda; vacío = sin filtro */
  query: string;
};

type PlacesStore = PlacesFilters & {
  setCategoria: (categoria: string) => void;
  setQuery: (query: string) => void;
  reset: () => void;
};

const INITIAL_FILTERS: PlacesFilters = { categoria: "", query: "" };

/**
 * Estado global de los lugares: filtros de categoría y búsqueda.
 *
 * Lo consumen los hooks de TanStack Query para armar la `queryKey`
 * (y por lo tanto la caché). La UI de filtros todavía no existe.
 * TODO: reutilizar este mismo patrón para sesión de usuario y favoritos.
 */
export const usePlacesStore = create<PlacesStore>((set) => ({
  ...INITIAL_FILTERS,
  setCategoria: (categoria) => set({ categoria }),
  setQuery: (query) => set({ query }),
  reset: () => set(INITIAL_FILTERS),
}));

/** Solo los filtros, para usarlos dentro de la `queryKey` sin re-renderizar. */
export const selectPlacesFilters = (state: PlacesFilters) => state;