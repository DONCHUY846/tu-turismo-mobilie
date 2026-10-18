import { apiRequest } from "@/lib/api";

/** Lugar recomendado por el motor de IA. */
export type AIRecommendation = {
  id: string;
  nombre: string;
  municipio: string;
  /** suele venir vacía */
  categoria: string;
  /**
   * A veces trae coordenadas en vez de descripción
   * (ej. "20.421304, -103.393293"), por eso la UI no la muestra.
   */
  descripcion: string;
  imagen_url: string;
  rating_promedio: number | null;
  /** afinidad de 0 a 1 que le da el modelo a este lugar */
  probabilidad_ia: number;
  /** por qué lo recomienda, ej. "Destacado por nuestra comunidad de turistas" */
  razon: string;
};

/** Resultado del envío del itinerario por correo. */
export type RecommendationEmailResult = {
  success: boolean;
  message: string;
  /** true mientras el backend no manda el correo real */
  simulated: boolean;
  count: number;
};

/**
 * Respuesta de `POST /api/v1/core/users/send-recommendations/`.
 *
 * Se declara el sobre completo (no solo `data`) porque el endpoint devuelve
 * además `email_result` y `message`, que `apiFetch` descartaría.
 */
export type SendRecommendationsResponse = {
  success: boolean;
  data: AIRecommendation[];
  email_result: RecommendationEmailResult;
  message: string;
};

/**
 * Pide las recomendaciones de IA y dispara su envío por correo.
 * POST /api/v1/core/users/send-recommendations/ (requiere sesión: usa el email
 * del token, el payload va vacío).
 */
export function sendRecommendations(accessToken: string) {
  return apiRequest<SendRecommendationsResponse>("/core/users/send-recommendations/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });
}
