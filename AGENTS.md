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
- Estructura actual: `src/app/(tabs)/` (Inicio, Explorar, Perfil) con la barra inferior propia vía `tabBar` en `(tabs)/_layout.tsx`; `login.tsx` vive en el Stack raíz para que no herede las pestañas. El grupo `(tabs)` no aparece en la URL: `(tabs)/index.tsx` sigue siendo `/`. El mapa vive en `(tabs)/explorar.tsx`.
- Rutas privadas: `src/app/(app)/` con su propio `Stack.Protected guard={isAuthenticated}` (ver `(app)/_layout.tsx`) y registrado en el Stack raíz con `<Stack.Screen name="(app)" />`. El grupo tampoco aparece en la URL: `(app)/editar-perfil.tsx` es `/editar-perfil`.
- La barra de navegación usa **JS tabs** (`expo-router/tabs`) y no native tabs, para conservar los íconos de lucide y los colores de marca. `AppTabBar` (`src/components/navigation/`) adapta las rutas del navegador a `BottomTabBar`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Enlaces del footer (`src/data/home.ts`): el `href` decide cómo se abre — URL externa → `Linking.openURL` (navegador del sistema), ancla `#seccion` → scroll a la sección de la home (el home mide cada sección con `onLayout` y el `AppFooter` recibe `onPressAnchor`), ruta interna → `router.push` cuando existan.
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

## Componentes de mapa: mapcn-rn

El mapa de exploración usa **mapcn-rn** (copy-owned, mismo espíritu que reusables) sobre `@maplibre/maplibre-react-native` con basemap CARTO (no requiere API key). Se instala con `npx mapcn-rn init` y los componentes con `npx mapcn-rn add <componente>` (`map`, `marker`, `popup`, `controls`, `geojson`…). `mapcn.json` guarda renderer/provider y los hashes del vendido; `npx mapcn-rn doctor` verifica la instalación y `npx mapcn-rn diff` las divergencias locales.

- **Nunca escribas a mano ni edites `src/components/ui/mapcn/` ni `src/lib/mapcn/`** (rompes los hashes del registry). La única excepción es la divergencia documentada abajo.
- **Divergencias locales en `map.tsx` y `map-marker.tsx`**:
  - `map.tsx`: el vendido no cablea `onDidFailLoadingMap` → `onError` (un mapa sin red quedaría en blanco silencioso); aquí sí.
  - `map-marker.tsx`: el vendido pasa `onPress` a un `<Pressable>` interno y **olvida pasarlo al `<Marker>`** de `@maplibre/maplibre-react-native` (en Android `MLRNMarkerViewContent` tiene `width/height = 0` fuera de Yoga y los toques los despacha `MLRNMapView.onMapClick` → `Marker.onPress`; en iOS `ViewAnnotation` hace lo mismo); aquí `onPress` va en `<Marker>`.
  - `mapcn-rn diff` los marca *"modified since install"* — si un futuro `mapcn-rn add` los sobrescribe, re-aplica ambos cables.
- `MapExplorer` (`src/components/map/`) pide places/restaurants/events con `?limit=100` (misma terna que el mapa web) y normaliza todo a puntos de mapa. Filtra `coordenadas: null` y `activo: false` **antes de renderizar**; nunca asumas lat/lng.
- Markers y rail flotante (`MapCategoryRail`) por tipo (espejados de la web): Landmark `bg-blue-600` (lugares), Utensils `bg-orange-600` (restaurantes), CalendarDays `bg-emerald-600` (eventos), Compass `bg-blue-600` (todos) y Heart `bg-rose-600` (favoritos, visible solo con sesión iniciada). Al tocar un marker se abre `RecursoDetailSheet` (hermano del `Map`).
- Cámara: se encuadra con `bounds` de los pins reales (+ padding 0.02°). `bounds` y `defaultViewport.center` son **mutuamente excluyentes** en el contrato del `Map` — no pases ambos.
- El mapa está fijado en claro (`colorScheme="light"`): `global.css` aún no tiene paleta oscura (TODO en `.dark:root`). Al soportar dark mode, quita el pin y el basemap alterna solo (CARTO resuelve Voyager/Dark Matter).
- El ornamento `attribution={{ position: "bottom-left" }}` es requisito legal del basemap CARTO/OSM — no lo quites.
- Estados: skeleton (CardSkeleton) mientras cargan los 3 recursos, `SectionErrorState` si fallan los tres **o** si el mapa no carga (tiles/estilo; el reintento remonta el `Map` cambiando su `key`), y texto de vacío si no hay puntos con coordenadas. Un solo recurso fallando ⇒ se muestran los otros dos.
- Rendimiento: hasta ~300 `MapMarker` nativos pueden laggear en Android; mapcn recomienda capas GeoJSON arriba de ~100. Si el teléfono lo sufre: `npx mapcn-rn add geojson` y migrar los puntos a la capa.
- **Requiere dev build** (MapLibre no viene en Expo Go): `eas.json` ya tiene el perfil `development` (APK Android, proyecto EAS `donchuy846/tu-turismo-mobile` ya linkeado). Probar en teléfono: `npx eas-cli@latest build --profile development --platform android`, instalar el APK y conectar con `npx expo start --tunnel --dev-client`.
- Lint: `@typescript-eslint/array-type` está apagada para los paths vendidos en `eslint.config.js` (los warnings eran del CLI, no del app).

## Datos, estado y caché

- `src/lib/api.ts` — cliente HTTP: `apiFetch<T>()` (desenvuelve el sobre `{ success, data }`) y `apiRequest<T>()` (JSON plano). `API_URL` vive en `src/lib/config.ts` (de `EXPO_PUBLIC_API_URL`, ver `.env.example`). Todo fetch pasa por aquí, y el transporte también se encarga del token de sesión (ver **Autenticación**).
  - El `Content-Type: application/json` solo se pone si el body es un **string**. Con un `FormData` (subida de imágenes) el `fetch` debe poner el `boundary`; si el transporte lo fuerza, la subida se manda con un tipo que no corresponde.
- `src/services/<recurso>.ts` — un archivo por recurso del backend (`places.ts`, `events.ts`, `restaurants.ts`): tipos del dominio + funciones `fetchX(params)`. Los tipos reflejan lo que la API devuelve hoy; no inventes campos.
- `QueryClientProvider` vive en `src/app/_layout.tsx`. Los datos se piden siempre con `useQuery` y una `queryKey` que incluya **todos** los filtros del store.
- Estados obligatorios en cada lista: **carga** (skeletons, no spinners), **error** (mensaje + reintentar con `refetch`) y **vacío**.
- `src/stores/` — estado global con Zustand (`usePlacesStore` con los filtros de lugares). Los datos del servidor **no** se guardan ahí, para eso está la caché de TanStack Query.
- La API no tiene paginación ni CORS en algunos entornos: si haces scroll infinito, confirma que el backend soporte el parámetro antes de implementarlo.
- Estado de red: `expo-network` (viene en Expo Go). `src/hooks/useIsOnline.ts` para los avisos de "sin conexión" y `NetworkStateSync` en `_layout.tsx` para alimentar el `onlineManager` de TanStack Query. No hardcodear el banner offline.
- Fechas: llegan como texto (`"2026-07-25"` o `"2026-09-03 00:00:00"`). Formatear siempre con `src/lib/format.ts`; no usar `new Date()` directo ni `Intl`, para no tener desfases de zona horaria.
- Estados de lista reutilizables: `CardSkeleton` (carga), `SectionErrorState` (error + reintento) y el texto de vacío de cada sección.

## Formularios y validación

- `src/lib/validators.ts` — los esquemas **Zod** de los formularios (`loginSchema`, `registerSchema`, `profileSchema`) y sus tipos. Los esquemas además **transforman** los valores (recortan, bajan a minúsculas el correo, dejan el teléfono solo con dígitos), así que lo que sale de `parse` ya va normalizado al backend.
- Los formularios usan **react-hook-form + `@hookform/resolvers/zod`**: el componente del formulario se encarga de la validación (`useForm` + `zodResolver`) y entrega los datos ya validados a la pantalla, que es la que hace la mutación.
- **En React Native, los campos van con `useController`, nunca con `register`**: `register` espera eventos de web (`event.target.value`) y además devuelve `onBlur: onChange` (el mismo handler), así que con el evento de blur de RN —que no trae `target` en el nivel superior— RHF guardaba el **objeto del evento** como valor del campo y **todos** los campos fallaban la validación (o reventaba al salir del campo). Con `useController` se usa `onChangeText={field.onChange}` (recibe el texto plano) y `onBlur={field.onBlur}` (no necesita argumentos), y `value={field.value}` deja el input controlado.
- `src/components/FormField.tsx` — el campo con etiqueta, ícono, input y error, compartido por los formularios de auth y el de perfil.
- **El backend casi no valida** (acepta contraseñas de 5 letras, correos inválidos y teléfonos vacíos): la validación del cliente es la única barrera. `POST /core/auth/register/` solo rechaza el email duplicado y tiene un rate limit de 5 intentos (429).

## Autenticación

- `src/services/auth.ts` — `login`, `refreshSession` y `fetchProfile`. Estos endpoints responden **JSON plano** (sin sobre `{success,data}`), por eso usan `apiRequest` y no `apiFetch`.
- `src/services/auth.ts` — además `register()` (POST `/core/auth/register/`, responde igual que el login: **registrarse inicia sesión**), `updateProfile()` (PUT `/core/auth/me/`, acepta `nombre`, `apellido`, `email`, `telefono`, `avatar` y `password`), `uploadAvatar()` (POST `/core/upload/`, `FormData` con `file` + `folder: "tu-turismo/avatars"`) y la **recuperación de contraseña**: `sendPasswordCode`, `verifyPasswordCode`, `resetPassword` (POST `/auth/password/send-code|verify-code|reset/`; **sin** el prefijo `core`). Todos responden JSON plano con `authenticated: false` (solo se llaman de invitado), y sus errores vienen en `{ success, message }` (no en `{ error, detail }`).
- El `rol` del alta va **siempre fijo en `"turista"`**: el backend acepta el que le mande el cliente (incluso `"admin"`), así que no se toma de los datos del formulario.
- `src/stores/auth-store.ts` — Zustand + `persist` sobre un adaptador de `expo-secure-store`. Estado: `status: "loading" | "authenticated" | "guest"`, `accessToken`, `refreshToken`, `expiresAt`, `user`, `sessionExpired`. Se persiste solo la sesión, nunca `status` ni `sessionExpired`.
- **El transporte es el dueño del token** (`src/lib/api.ts`): `apiRequest` inyecta `Authorization: Bearer <accessToken>` y renueva la sesión. Los servicios **no** reciben ni mandan tokens, y los endpoints de auth se marcan con `authenticated: false` para que no se intente refrescar.
  - **Refresh preventivo**: si el token vence en menos de 2 minutos (`expiresAt - now < PROACTIVE_REFRESH_WINDOW_MS`), se renueva antes de gastar la petición.
  - **Refresh reactivo**: un 401 dispara un refresh y **un solo reintento** de la petición original. El refresh es una promesa compartida a nivel de módulo, así que varias peticiones en paralelo que reciben 401 a la vez disparan un único refresh.
  - `src/lib/auth-refresh.ts` hace el POST a `/core/auth/refresh/`. No usa `apiRequest` a propósito: el transporte lo importa, y llamarlo desde ahí sería un ciclo de imports. `src/lib/config.ts` tiene `API_URL` por lo mismo.
  - La respuesta del refresh **no trae `refresh_token` ni `user`**: `applyRefresh` conserva los valores previos y solo actualiza `accessToken` y `expiresAt`. El refresh token del backend es reutilizable, no se invalida al usarlo.
- Si el refresh token también expiró, `expireSession()` deja `status: "guest"` y `sessionExpired: true`; `SessionExpiryWatcher` en `src/app/_layout.tsx` manda al login con `params: { reason: "expired" }` y el login avisa *"Tu sesión expiró. Vuelve a iniciar sesión."*.
- El splash se oculta en `src/app/_layout.tsx` cuando `status !== "loading"` y las fuentes están cargadas: evita el parpadeo del login.
- Rutas: `src/app/_layout.tsx` declara `unstable_settings.anchor = "(tabs)"` y protege con `<Stack.Protected guard={...}>`. Hoy solo el login está protegido; cuando existan rutas privadas, agrúpalas en `src/app/(app)/` con su propio `Stack.Protected guard={isAuthenticated}`.
- El acceso al login es **solo desde `src/app/(tabs)/perfil.tsx`**: invitado → la pestaña redirige a `/login`; con sesión → datos de `auth/me/` y botón de cerrar sesión.
- **Cerrar sesión**: `src/hooks/useSignOut.ts` (`signOut()` + `queryClient.clear()` + `router.navigate("/")`). El botón pide confirmación con un `AlertDialog` (componente de `react-native-reusables`, ya instalado) dentro de `ProfileActions`.
  - `queryClient.clear()` es obligatorio: sin él, la query `["profile", userId]` y la caché de favoritos seguirían mostrando datos del usuario anterior al entrar con otra cuenta.
  - El backend **no tiene endpoint de logout** (ni blacklist): el cierre es local. El refresh token sigue vivo en el servidor hasta expirar, pero se borra del dispositivo.
  - El login solo se alcanza con `push` (desde la tarjeta de invitado), así que su botón "Volver" siempre tiene destino. El logout no pasa por el login: manda a Inicio, ya como invitado.
- Después de `signIn()` hay que navegar con `router.replace("/")`, nunca `push` (para no dejar el login en el historial).
- TODO global: no hay endpoint de logout (el token expira solo).
- **Recuperación de contraseña** (`/recuperar-contrasena`, solo invitados): tres pasos en una pantalla — correo (`send-code`), código (`verify-code`) y contraseña nueva (`reset`) — con el correo y el código en el estado local de la pantalla; al terminar regresa al login con `reason=password-reset`. Se llega desde el enlace "¿Olvidaste tu contraseña?" del `LoginForm`.
- Pendiente del backend (bloquean features, no son del cliente):
  - `POST /core/upload/` responde **500** (`Invalid cloud_name tuturismo`): el cloud name correcto es `dxcqksjbp`. Hasta que se arregle, la foto de perfil no se puede subir.
  - `PUT /core/auth/me/` con `password` responde **500**: el serializer no llama `set_password`. El formulario de `/editar-perfil` ya manda el campo, listo para cuando se arregle.
  - **El correo de recuperación no llega**: `send-code` responde **200** `"Código enviado correctamente. Revisa tu correo o consola de logs."`, pero sin SMTP el código solo cae en los logs del servidor. Todo el flujo del cliente ya está listo; falta la entrega real para probar el paso de verificar + resetear con un código válido.
  - Duda abierta del flujo: `verify-code` y `reset` usan el mismo mensaje *"El código es incorrecto o ya fue utilizado."* — no está confirmado si **`verify-code` consume el código** al verificarlo. Si al resetear tras verificar saliera ese error, hay que quitar la llamada a `verifyPasswordCode` (el `reset` valida el código por sí mismo): un cambio de una línea en `src/app/recuperar-contrasena.tsx`.

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md