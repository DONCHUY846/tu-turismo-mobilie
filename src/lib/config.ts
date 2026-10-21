/**
 * Configuración del backend.
 *
 * Vive en su propio módulo (y no en `lib/api.ts`) para que el cliente de
 * refresh pueda armar URLs sin importar el transporte: si `lib/api.ts` importara
 * al cliente de refresh y este a `lib/api.ts`, se formsaría un ciclo de imports.
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://tuturismo-backend.onrender.com/api/v1";
