This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Componentes: react-native-reusables

Los componentes base se agregan con la CLI de react-native-reusables (shadcn/ui para React Native). **Nunca los escribas a mano ni edites `src/components/ui/`**: si falta uno, se agrega con el comando.

```bash
npx @react-native-reusables/cli@latest add <componentes>   # ej: add button card badge text icon separator
npx @react-native-reusables/cli@latest doctor              # verifica la instalación
```

Opciones útiles de `add`: `-y` (sin confirmaciones), `-o` (sobrescribe), `-p <path>` (destino, por defecto usa el alias `ui` de `components.json`), `-a` (todos), `--styling-library nativewind|uniwind`.
Docs: https://reactnativereusables.com/docs/installation/manual

- `src/components/ui/` — componentes copiados de la CLI. Props y variantes no se modifican; se extienden con `className`.
- `src/components/` — componentes propios de la app, reutilizables y con props explícitas (nada hardcodeado de una pantalla en particular).
- Iconos con `lucide-react-native` a través del wrapper `<Icon as={...} className="..." size={...} />` de `src/components/ui/icon.tsx`.
- Estilos con NativeWind (`className`). Los colores de la marca se declaran como CSS vars en `global.css` y se mapean en `tailwind.config.js`; su espejo en HSL para APIs que no aceptan clases está en `src/lib/theme.ts` (`THEME` / `NAV_THEME`).
- `className` solo funciona en los componentes que NativeWind registra por interop: los de `react-native` (`View`, `Text`, `Image`, `Pressable`, `ScrollView`, `FlatList`…) y `SafeAreaView`. **En `expo-image` no aplica**: envuélvelo en un `View` con clases y pásale las dimensiones por `style={{ width: "100%", height: "100%" }}`.
- Al agregar un componente que use overlays (dialog, popover, tooltip, dropdown), `PortalHost` en `src/app/_layout.tsx` es obligatorio.

## Datos, estado y caché

- `src/lib/api.ts` — `API_URL` (de `EXPO_PUBLIC_API_URL`, ver `.env.example`) y `apiFetch<T>()`, que desenvuelve el sobre `{ success, data }` del backend. Todo fetch pasa por ahí.
- `src/services/<recurso>.ts` — un archivo por recurso del backend (`places.ts`, más adelante `events.ts`, `restaurants.ts`): tipos del dominio + funciones `fetchX(params)`. Los tipos reflejan lo que la API devuelve hoy; no inventes campos.
- `QueryClientProvider` vive en `src/app/_layout.tsx`. Los datos se piden siempre con `useQuery` y una `queryKey` que incluya **todos** los filtros del store.
- Estados obligatorios en cada lista: **carga** (skeletons, no spinners), **error** (mensaje + reintentar con `refetch`) y **vacío**.
- `src/stores/` — estado global con Zustand (`usePlacesStore` con los filtros de lugares). Los datos del servidor **no** se guardan ahí, para eso está la caché de TanStack Query.
- La API no tiene paginación ni CORS en algunos entornos: si haces scroll infinito, confirma que el backend soporte el parámetro antes de implementarlo.
- Estado de red: `expo-network` (viene en Expo Go). `src/hooks/useIsOnline.ts` para los avisos de "sin conexión" y `NetworkStateSync` en `_layout.tsx` para alimentar el `onlineManager` de TanStack Query. No hardcodear el banner offline.
- Fechas: llegan como texto (`"2026-07-25"` o `"2026-09-03 00:00:00"`). Formatear siempre con `src/lib/format.ts`; no usar `new Date()` directo ni `Intl`, para no tener desfases de zona horaria.
- Estados de lista reutilizables: `CardSkeleton` (carga), `SectionErrorState` (error + reintento) y el texto de vacío de cada sección.

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md