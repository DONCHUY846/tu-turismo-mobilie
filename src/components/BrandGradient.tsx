import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { StyleSheet, View } from "react-native";

import { GRADIENTS } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type BrandGradientDirection = "horizontal" | "vertical" | "diagonal";

/**
 * Puntos de inicio y fin de cada dirección, como fracción del tamaño de la vista.
 * "diagonal" va de la esquina superior izquierda a la inferior derecha, que es lo
 * que `bg-gradient-to-br` resolvía en web.
 */
const POINTS: Record<
  BrandGradientDirection,
  { start: [number, number]; end: [number, number] }
> = {
  horizontal: { start: [0, 0], end: [1, 0] },
  vertical: { start: [0, 0], end: [0, 1] },
  diagonal: { start: [0, 0], end: [1, 1] },
};

export type BrandGradientProps = {
  /** al menos dos colores; por defecto el degradado de marca (cian -> morado) */
  colors?: readonly [string, string, ...string[]];
  direction?: BrandGradientDirection;
  /** posiciones de cada parada (0-1), en el mismo orden que `colors` */
  locations?: readonly [number, number, ...number[]];
  className?: string;
  children?: React.ReactNode;
};

/**
 * Fondo degradado de la marca.
 *
 * Sustituye a `bg-gradient-to-*` + `from-*`/`to-*`, que NativeWind ignora en
 * iOS y Android: `background-image` no existe en `react-native-css-interop`, así
 * que esas clases se veían solo en web y en nativo dejaban el `View` transparente.
 *
 * Los colores no pueden venir en clases (van como props), y todo lo demás —
 * radio, `overflow-hidden`, tamaño, sombra — sigue en `className`. El degradado
 * se pinta como capa absoluta detrás de `children`.
 */
export function BrandGradient({
  colors = GRADIENTS.brand,
  direction = "diagonal",
  locations,
  className,
  children,
}: BrandGradientProps) {
  const { start, end } = POINTS[direction];

  return (
    <View className={cn("overflow-hidden", className)}>
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        locations={locations}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
