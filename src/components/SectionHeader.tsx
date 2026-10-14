import * as React from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** "center" para cabeceras centrado (categorías), "left" para listados */
  align?: "left" | "center";
  /** acción opcional a la derecha (ej. "Ver todos") */
  action?: { label: string; onPress?: () => void };
  className?: string;
};

/**
 * Cabecera reutilizable de sección: título, subtítulo y acción opcional.
 * Es el encabezado de todas las secciones de la home.
 */
export function SectionHeader({
  title,
  subtitle,
  align = "left",
  action,
  className,
}: SectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <View className={cn("mb-5 gap-y-0.5", isCentered && "items-center text-center", className)}>
      <Text className="text-2xl font-bold tracking-tight text-foreground">{title}</Text>
      {subtitle ? (
        <Text className={cn("text-xs text-muted-foreground", isCentered && "max-w-64")}>
          {subtitle}
        </Text>
      ) : null}
      {action ? (
        <Text
          accessibilityRole="button"
          className="mt-2 self-end text-xs font-semibold text-brand-cyan"
          onPress={action.onPress}
        >
          {action.label}
        </Text>
      ) : null}
    </View>
  );
}