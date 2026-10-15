import * as React from "react";
import { View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type CardSkeletonProps = {
  /** alto del bloque de imagen (176 en las cards de la API) */
  imageHeight?: number;
  /** renglones de texto bajo la imagen */
  rows?: number;
  /** muestra el placeholder del botón "Ver más" */
  action?: boolean;
  className?: string;
};

/**
 * Placeholder genérico de card mientras carga cualquier listado
 * (lugares, eventos o restaurantes). Reemplaza a un skeleton por tipo.
 */
export function CardSkeleton({
  imageHeight = 176,
  rows = 2,
  action = true,
  className,
}: CardSkeletonProps) {
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel="Cargando"
      className={cn(
        "gap-y-3 overflow-hidden rounded-2xl border border-border bg-card p-4",
        className
      )}
    >
      <Skeleton className="w-full rounded-xl" style={{ height: imageHeight }} />
      <Skeleton className="h-4 w-3/5" />
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={cn("h-3", index % 2 === 0 ? "w-full" : "w-3/5")} />
      ))}
      {action ? (
        <View className="flex-row justify-end">
          <Skeleton className="h-7 w-20 rounded-lg" />
        </View>
      ) : null}
    </View>
  );
}