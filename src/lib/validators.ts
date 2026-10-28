import * as z from "zod";

/**
 * Esquemas de validación de los formularios (Zod).
 *
 * El backend casi no valida: acepta contraseñas de 5 letras, correos
 * inválidos y teléfonos vacíos. Por eso estas reglas son las que de verdad
 * protegen los datos.
 *
 * Los esquemas además **transforman** los valores (recortan espacios, bajan el
 * correo a minúsculas, dejan el teléfono solo con dígitos), así que lo que
 * sale de `parse` ya va listo para mandarse al backend.
 */

/** Formulario de acceso. */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Escribe tu correo.")
    .toLowerCase()
    .pipe(z.email("Escribe un correo válido.")),
  password: z.string().min(1, "Escribe tu contraseña."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/** Campos que comparten el alta y la edición del perfil. */
const PROFILE_FIELDS = {
  nombre: z.string().trim().min(2, "Escribe tu nombre."),
  apellido: z.string().trim().min(2, "Escribe tu apellido."),
  email: z
    .string()
    .trim()
    .min(1, "Escribe tu correo.")
    .toLowerCase()
    .pipe(z.email("Escribe un correo válido.")),
  telefono: z
    .string()
    .trim()
    .min(1, "Escribe tu número de teléfono.")
    // se queda solo con dígitos: "33 178 67 06 2" → "3317867062"
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().regex(/^\d{10}$/, "El teléfono debe tener 10 dígitos.")),
};

/**
 * Formulario de alta.
 *
 * `confirmPassword` solo existe en el formulario: no se manda al backend
 * (ver `register()` en `src/services/auth.ts`).
 */
export const registerSchema = z
  .object({
    ...PROFILE_FIELDS,
    password: z.string().min(8, "La contraseña necesita al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Repite la contraseña."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/** Valores del alta sin la confirmación, ya listos para la API. */
export type RegisterPayload = Omit<RegisterFormValues, "confirmPassword">;

/**
 * Formulario de edición del perfil: los mismos datos que el alta, pero la
 * contraseña es opcional (vacío = no cambiarla).
 */
export const profileSchema = z
  .object({
    ...PROFILE_FIELDS,
    password: z
      .string()
      .refine((value) => value.length === 0 || value.length >= 8, {
        message: "La contraseña necesita al menos 8 caracteres.",
      }),
    confirmPassword: z.string(),
  })
  .refine((values) => !values.password || values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;

/**
 * Recuperación de contraseña, paso 1: el correo al que se manda el código.
 *
 * Reutiliza la regla del correo del login para que la normalización
 * (recortar, minúsculas) viva en un solo lugar.
 */
export const forgotPasswordEmailSchema = z.object({
  email: loginSchema.shape.email,
});

export type ForgotPasswordEmailValues = z.infer<typeof forgotPasswordEmailSchema>;

/** Recuperación, paso 2: el código que llegó al correo. */
export const forgotPasswordCodeSchema = z.object({
  code: z.string().trim().min(1, "Escribe el código que recibiste."),
});

export type ForgotPasswordCodeValues = z.infer<typeof forgotPasswordCodeSchema>;

/**
 * Recuperación, paso 3: la contraseña nueva, con las mismas reglas que el
 * alta (mínimo 8) y su confirmación.
 */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña necesita al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Repite la contraseña."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
