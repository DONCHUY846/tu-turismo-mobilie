import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { IconTile, type IconTone } from "@/components/IconTile";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type CategoryCardProps = {
  label: string;
  icon: LucideIcon;
  tone: IconTone;
  onPress?: () => void;
  /** clase extra; define el ancho dentro del grid (por defecto 2 columnas) */
  className?: string;
};

/**
 * Tarjeta de categoría: cuadro de icono + etiqueta, en columna dentro del grid.
 * Reutilizable en la home y en listados de categoría.
 */
export function CategoryCard({ label, icon, tone, onPress, className }: CategoryCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        "w-[48%] items-center justify-center rounded-2xl border border-border bg-card px-4 py-5",
        "shadow-sm shadow-black/5 active:opacity-70",
        "sm:w-[31%]",
        className
      )}
    >
      <IconTile icon={icon} tone={tone} />
      <Text className="text-center text-sm font-semibold text-foreground">{label}</Text>
    </Pressable>
  );
}

/**
 * Contenedor del grid de categorías: 2 columnas en móvil, 3 en pantallas anchas.
 * ```
 * <CategoryGrid>
 *   {categories.map((c) => (
 *     <CategoryCard key={c.key} {...c} />
 *   ))}
 * </CategoryGrid>
 * ```
 */
export function CategoryGrid({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("flex-row flex-wrap gap-3.5", className)} {...props} />;
}