import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type FavoriteRowProps = {
  title: string;
  subtitle?: string;
  /** nota a la derecha, p. ej. el rating */
  value?: number | null;
  imageUrl?: string;
  className?: string;
};

/**
 * Fila compacta de un recurso guardado (lugar, evento o restaurante):
 * miniatura, nombre, detalle y nota.
 *
 * No es presionable todavía: la pantalla de detalle no existe, así que no se
 * pone un `Pressable` que no lleva a ninguna parte.
 * TODO: enlazar con `/lugares/[id]` y `/eventos/[id]` cuando existan.
 */
export function FavoriteRow({
  title,
  subtitle,
  value,
  imageUrl,
  className,
}: FavoriteRowProps) {
  const hasImage = Boolean(imageUrl);

  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-2xl border border-border bg-card p-2.5",
        className
      )}
    >
      {/* Miniatura; si el recurso no trae imagen, un bloque neutro */}
      <View className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {hasImage ? (
          <Image
            source={{ uri: imageUrl }}
            contentFit="cover"
            // `expo-image` no tiene interop de NativeWind: las dimensiones van por `style`.
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel={title}
            transition={200}
          />
        ) : null}
      </View>

      <View className="flex-1 gap-y-0.5">
        <Text className="text-sm font-bold leading-snug text-slate-900" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-[11px] leading-snug text-slate-500" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value !== undefined && value !== null ? (
        <View className="flex-row items-center gap-0.5">
          <Icon as={Star} className="text-amber-500" size={13} fill="currentColor" />
          <Text className="text-xs font-bold text-amber-500">{value.toFixed(1)}</Text>
        </View>
      ) : null}
    </View>
  );
}
