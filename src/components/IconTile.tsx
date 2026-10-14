import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Paletas del cuadro de icono: fondo suave + icono saturated. */
const ICON_TONES = {
  pink: { container: "bg-pink-50", icon: "text-pink-500" },
  purple: { container: "bg-purple-50", icon: "text-purple-500" },
  violet: { container: "bg-violet-50", icon: "text-violet-500" },
  blue: { container: "bg-blue-50", icon: "text-blue-500" },
  amber: { container: "bg-amber-50", icon: "text-amber-500" },
  emerald: { container: "bg-emerald-50", icon: "text-emerald-500" },
} as const;

export type IconTone = keyof typeof ICON_TONES;

export function isIconTone(value: string): value is IconTone {
  return value in ICON_TONES;
}

export type IconTileProps = {
  icon: LucideIcon;
  tone: IconTone;
  /** lado del cuadro en px; 48 por defecto (w-12 h-12 del diseño) */
  size?: number;
  className?: string;
};

/**
 * Cuadrado redondeado con un icono de Lucide, usado como elemento visual
 * decorativo de las tarjetas (categorías, secciones de información, etc.).
 */
export function IconTile({ icon, tone, size = 48, className }: IconTileProps) {
  const palette = ICON_TONES[tone];
  const iconSize = Math.round(size * 0.5);

  return (
    <View
      className={cn(
        "mb-2.5 items-center justify-center rounded-xl",
        palette.container,
        className
      )}
      style={{ width: size, height: size }}
    >
      <Icon as={icon} className={palette.icon} size={iconSize} />
    </View>
  );
}