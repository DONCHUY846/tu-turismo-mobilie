import * as React from "react";
import { View } from "react-native";

import { CardSkeleton } from "@/components/CardSkeleton";
import { SectionErrorState } from "@/components/SectionErrorState";
import { SavedListSection } from "@/components/profile/SavedListSection";

export type SavedFavoritesSectionProps = {
  icon: React.ComponentProps<typeof SavedListSection>["icon"];
  /** clases del cuadro de icono, p. ej. "bg-amber-50 text-amber-500" */
  iconClassName?: string;
  title: string;
  subtitle: string;
  /** cuántos recursos hay ya resueltos en la lista hidratada */
  count: number;
  countLabels?: [string, string];
  /** filas ya resueltas; si no hay, se muestra `emptyState` */
  children?: React.ReactNode;
  emptyState?: React.ReactNode;
  isPending?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  /** cuántos skeletons mostrar mientras carga */
  skeletonCount?: number;
  className?: string;
};

/**
 * `SavedListSection` con los tres estados de una lista de favoritos ya hidratada:
 * carga (skeletons), error (mensaje + reintento) y lista o estado vacío.
 *
 * `count` es el número de recursos ya resueltos: un favorito cuyo detalle no se
 * pudo traer no cuenta, para no prometer algo que no se va a pintar.
 */
export function SavedFavoritesSection({
  icon,
  iconClassName,
  title,
  subtitle,
  count,
  countLabels,
  children,
  emptyState,
  isPending = false,
  isError = false,
  error,
  onRetry,
  skeletonCount = 2,
  className,
}: SavedFavoritesSectionProps) {
  return (
    <SavedListSection
      icon={icon}
      iconClassName={iconClassName}
      title={title}
      subtitle={subtitle}
      count={count}
      countLabels={countLabels}
      className={className}
      emptyState={
        isPending ? (
          <View accessibilityRole="summary" accessibilityLabel="Cargando" className="gap-3">
            {Array.from({ length: skeletonCount }, (_, index) => (
              <CardSkeleton key={index} imageHeight={64} rows={1} action={false} />
            ))}
          </View>
        ) : isError ? (
          <SectionErrorState detail={error?.message} onRetry={onRetry} />
        ) : (
          emptyState
        )
      }
    >
      {children}
    </SavedListSection>
  );
}
