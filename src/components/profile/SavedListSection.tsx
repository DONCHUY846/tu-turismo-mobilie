import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type SavedListSectionProps = {
  icon: LucideIcon;
  /** clases del cuadro de icono, p. ej. "bg-amber-50 text-amber-500" */
  iconClassName?: string;
  title: string;
  subtitle: string;
  /** número que se muestra en la pastilla de la derecha */
  count: number;
  /** singular/plural del contador, p. ej. ["item", "items"] */
  countLabels?: [string, string];
  /** contenido de la lista; si viene vacío se muestra el estado vacío */
  children?: React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
};

/**
 * Tarjeta de lista guardada (favoritos, eventos guardados): encabezado con ícono,
 * título, subtítulo y contador; separador y contenido.
 */
export function SavedListSection({
  icon,
  iconClassName = "bg-cyan-50 text-cyan-600",
  title,
  subtitle,
  count,
  countLabels = ["item", "items"],
  children,
  emptyState,
  className,
}: SavedListSectionProps) {
  return (
    <View
      className={cn(
        "gap-4 rounded-[28px] border border-border bg-card p-5 shadow-md shadow-slate-200/50",
        className
      )}
    >
      {/* Encabezado */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className={cn(
              "h-10 w-10 items-center justify-center rounded-2xl border border-transparent",
              iconClassName
            )}
          >
            <Icon as={icon} className={iconClassName} size={20} />
          </View>
          <View className="gap-y-0.5">
            <Text className="text-base font-bold leading-tight text-slate-900">{title}</Text>
            <Text className="text-xs text-slate-500">{subtitle}</Text>
          </View>
        </View>

        <View className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1">
          <Text className="text-xs font-semibold text-slate-700">
            {count} {count === 1 ? countLabels[0] : countLabels[1]}
          </Text>
        </View>
      </View>

      <Separator />

      {count > 0 && children ? children : emptyState}
    </View>
  );
}

export type SavedListEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/** Estado vacío de una lista guardada (contenedor punteado). */
export function SavedListEmptyState({
  icon,
  title,
  description,
}: SavedListEmptyStateProps) {
  return (
    <View className="items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-7">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon as={icon} className="text-slate-400" size={24} />
      </View>
      <Text className="text-center text-sm font-bold text-slate-800">{title}</Text>
      <Text className="max-w-72 text-center text-xs leading-relaxed text-slate-500">
        {description}
      </Text>
    </View>
  );
}