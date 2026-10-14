import * as React from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type SectionPlaceholderProps = {
  /** texto descriptivo de lo que irá aquí */
  hint: string;
  /** alto del placeholder en px */
  height?: number;
  className?: string;
};

/**
 * Marcador visual para secciones cuyo contenido todavía no existe.
 * Sustituir por la lista real (cards de lugares, eventos o restaurantes).
 */
export function SectionPlaceholder({
  hint,
  height = 160,
  className,
}: SectionPlaceholderProps) {
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`Pendiente: ${hint}`}
      className={cn(
        "items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-card px-4",
        className
      )}
      style={{ height }}
    >
      <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">TODO</Text>
      <Text className="text-center text-xs text-slate-400">{hint}</Text>
    </View>
  );
}