# Tu Turismo Mobile

Aplicación móvil de turismo para descubrir lugares, eventos y restaurantes, con mapa interactivo, favoritos y perfil de usuario. Construida con Expo y React Native para Android (iOS queda como trabajo futuro).

## Stack

- **Expo SDK 58** / React Native 0.88 / React 19
- **Expo Router** (rutas por archivos)
- **TypeScript** estricto
- **NativeWind 4** + componentes de [react-native-reusables](https://reactnativereusables.com/)
- **TanStack Query** para datos del servidor y **Zustand** para estado global
- **mapcn-rn** sobre MapLibre para el mapa (basemap CARTO, sin API key)
- **Backend externo** en Render: `https://tuturismo-backend.onrender.com/api/v1`

## Requisitos

- Node.js 24 (ver `.nvmrc`; el proyecto acepta 22.13+, 24.3+ o 26+)
- npm
- JDK 17 y Android Studio con el SDK de Android (API 36) para builds nativos locales
- Cuenta de Google Play para publicar el AAB

## Instalación

```bash
npm ci
cp .env.example .env   # opcional: solo si necesitas apuntar a otro backend
```

Variables de entorno:

| Variable | Uso | Secreto |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Base del backend | No (se embebe en el bundle) |

Si no se define, `src/lib/config.ts` usa el backend de Render por defecto. **Nunca** pongas secretos en variables `EXPO_PUBLIC_*`.

## Desarrollo

El mapa usa MapLibre, que **no está incluido en Expo Go**: se requiere un development build local.

```bash
# Compilar e instalar el cliente de desarrollo (requiere Android Studio/SDK)
npx expo run:android

# Siguientes arranques: conectar el teléfono al servidor local
npx expo start --dev-client
```

También puedes usar `npm run android` como alias del primer comando.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Inicia Metro |
| `npm run android` | Compila y ejecuta en Android local |
| `npm run ios` | Compila y ejecuta en iOS local (requiere macOS/Xcode) |
| `npm run web` | Inicia la versión web |
| `npm run lint` | ESLint vía `expo lint` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jest en modo interactivo |
| `npm run test:ci` | Jest con cobertura, modo CI |

## Pruebas

- **Jest 30** + **jest-expo** + **@testing-library/react-native 14**
- 9 suites y 54 pruebas: validadores Zod, formato de fechas, cliente HTTP (refresh de sesión), auth-store, favoritos y componentes de formulario.
- La cobertura se genera en `coverage/` y se sube como artefacto del CI. No hay umbral mínimo todavía.
- No se usan snapshots de UI completa ni pruebas E2E; el flujo crítico se valida manualmente en dispositivo.

```bash
npm run test:ci
```

## Integración continua

`.github/workflows/ci.yml` se ejecuta en cada Pull Request y en cada push a `main`:

1. `npm ci` con caché
2. `npm run typecheck`
3. `npm run lint`
4. `npx expo-doctor@1`
5. `npm run test:ci`
6. `npm audit --audit-level=high`
7. `npx expo export --platform android` (build de humo)
8. Artefactos: `coverage/` y `dist/`

Además:

- **CodeQL** analiza JavaScript/TypeScript en push a `main` y en Pull Requests.
- **Dependency Review** bloquea dependencias nuevas con vulnerabilidades altas o críticas.
- **Dependabot** propone actualizaciones semanales de npm y GitHub Actions.

## Build y release manual

El proyecto **no incluye configuración de EAS ni automatiza la publicación**. El AAB se compila en la máquina del responsable y se sube a mano en Google Play Console; no se guardan credenciales de Expo ni de Google en GitHub.

### Preparación de la firma (solo la primera vez)

1. Instalar JDK 17 y Android Studio con el SDK de Android; verificar `java -version` y que `ANDROID_HOME` esté configurado.
2. Generar el proyecto nativo:
   ```bash
   npx expo prebuild --platform android
   ```
   La carpeta `android/` se genera con CNG y está ignorada por Git.
3. Crear la upload key:
   ```bash
   keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
   Mover el archivo `.keystore` a `android/app/`. **Nunca** lo versiones.
   Si la app ya está publicada, usa la misma llave con la que se firmó; si se perdió, restablécala desde Play Console (App signing).
4. Guardar las credenciales en `~/.gradle/gradle.properties`, fuera del repositorio:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=...
   MYAPP_UPLOAD_KEY_PASSWORD=...
   ```
5. Configurar la firma `release` en `android/app/build.gradle`:
   - Agregar dentro de `signingConfigs`:
     ```gradle
     release {
         if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
             storeFile file(MYAPP_UPLOAD_STORE_FILE)
             storePassword MYAPP_UPLOAD_STORE_PASSWORD
             keyAlias MYAPP_UPLOAD_KEY_ALIAS
             keyPassword MYAPP_UPLOAD_KEY_PASSWORD
         }
     }
     ```
   - En `buildTypes.release`, cambiar `signingConfig signingConfigs.debug` por `signingConfig signingConfigs.release`.

   `android/` es regenerable: si ejecutas `npx expo prebuild --clean`, vuelve a aplicar este paso. La guía oficial está en [Create a release build locally](https://docs.expo.dev/guides/local-app-production/).

### Build de desarrollo

```bash
npx expo run:android
```

Compila e instala el dev client local. Para los siguientes arranques:

```bash
npx expo start --dev-client
```

### Release (AAB)

1. Actualizar en `app.json`:
   - `version`: versión visible en la tienda.
   - `android.versionCode`: entero que Play exige incrementar en cada subida.
2. Generar el bundle:
   ```bash
   cd android
   ./gradlew app:bundleRelease
   ```
   Salida: `android/app/build/outputs/bundle/release/app-release.aab`.
3. Subir el AAB en Play Console (track interno), revisar el release y promoverlo manualmente: interno → cerrado → producción.
4. Opcional: crear el tag `vX.Y.Z` como marca del release.

`android.versionCode` quedó en `5`, el siguiente después del `4` que está publicado en Play. Debe ser **mayor** que el último release y se incrementa antes de cada subida.

## Rollback

- **Google Play**: detener el rollout en Play Console. Si la versión ya llegó a producción, publicar un build nuevo con `versionCode` mayor desde el commit estable anterior; Play no permite bajar de versión.
- **Código**: revertir el commit en `main` mediante PR y crear un tag de parche como marca.
- **Build local**: conservar el AAB de cada release; si un build falla, corregir y recompilar desde el commit estable con un `versionCode` mayor.
- No hay OTA (`expo-updates` no está instalado): todo cambio llega por una nueva build y revisión de Play.

## Limitaciones conocidas

- Solo Android para release; iOS requiere cuenta Apple Developer.
- No hay ambiente de staging ni emulador en CI.
- No hay CD automatizado: el build y la publicación se ejecutan manualmente por seguridad.
- El backend está fuera de este repositorio y no tiene ambiente de pruebas.
- Quedan avisos `moderate`/`low` de `npm audit` en dependencias transitivas del tooling; no hay corrección sin romper el SDK.
- El correo de recuperación de contraseña depende de que el backend configure SMTP.

## Documentación

- Convenciones del proyecto: [`AGENTS.md`](AGENTS.md)
- Documentación de Expo: https://docs.expo.dev/
- Los entregables académicos, la guía de implementación DevOps y el checklist se mantienen localmente en `entrega-final/` (ignorado por Git).
