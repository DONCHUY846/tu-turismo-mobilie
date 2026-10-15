/**
 * Utilidades de formato para mostrar datos del backend.
 *
 * Las fechas llegan como texto ISO desde la API (`"2026-07-25"` o
 * `"2026-09-03 00:00:00"`), así que se parsean a mano: sin `Intl` y sin
 * desfases por zona horaria.
 */

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

/** Convierte `"2026-09-03 00:00:00"` o `"2026-09-03"` en `Date` (hora local). */
export function parseApiDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `Date` → `"3 de septiembre de 2026"`. */
function formatDate(date: Date): string {
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

/** `"2026-09-03 00:00:00"` → `"3 de septiembre de 2026"`. */
export function formatLongDate(value: string): string {
  const date = parseApiDate(value);
  return date ? formatDate(date) : "";
}

/**
 * Rango de fechas: si hay `fechaFin` se muestra `"del 17 al 25 de abril de 2026"`,
 * si no, la fecha de inicio sola.
 */
export function formatDateRange(start: string, end?: string): string {
  const startDate = parseApiDate(start);
  if (!startDate) return "";

  const endDate = end ? parseApiDate(end) : null;
  if (!endDate) return formatDate(startDate);

  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  return sameMonth
    ? `del ${startDate.getDate()} al ${endDate.getDate()} de ${MONTHS[startDate.getMonth()]} de ${startDate.getFullYear()}`
    : `${formatDate(startDate)} al ${formatDate(endDate)}`;
}

/** Ordena por fecha ascendente; los valores sin fecha se van al final. */
export function sortByDateAsc<T>(items: T[], getDate: (item: T) => string) {
  return [...items].sort((a, b) => {
    const aDate = parseApiDate(getDate(a));
    const bDate = parseApiDate(getDate(b));
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return aDate.getTime() - bDate.getTime();
  });
}