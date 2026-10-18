import { Image } from "expo-image";
import { MapPin, Sparkles, Star } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { AIRecommendation } from "@/services/recommendations";

export type RecommendationCardProps = {
  recommendation: AIRecommendation;
  className?: string;
};

/**
 * Recomendación suelta del motor de IA: miniatura, nombre, municipio, rating,
 * afinidad del modelo y el motivo de la recomendación.
 *
 * No muestra `descripcion` porque en algunos lugares el backend manda
 * coordenadas ("20.421304, -103.393293") en lugar de texto.
 */
export function RecommendationCard({ recommendation, className }: RecommendationCardProps) {
  const { nombre, municipio, imagen_url, rating_promedio, probabilidad_ia, razon } =
    recommendation;
  const hasImage = Boolean(imagen_url);
  const affinity = Math.round(probabilidad_ia * 100);

  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-2xl bg-white/15 p-2.5",
        className
      )}
    >
      {/* Miniatura; si la recomendación no trae imagen, un bloque neutro */}
      <View className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/20">
        {hasImage ? (
          <Image
            source={{ uri: imagen_url }}
            contentFit="cover"
            // `expo-image` no tiene interop de NativeWind: las dimensiones van por `style`.
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel={nombre}
            transition={200}
          />
        ) : null}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-bold leading-snug text-white" numberOfLines={1}>
          {nombre}
        </Text>

        {municipio ? (
          <View className="flex-row items-center gap-1">
            <Icon as={MapPin} className="shrink-0 text-white/70" size={12} />
            <Text className="text-[11px] text-white/80" numberOfLines={1}>
              {municipio}
            </Text>
          </View>
        ) : null}

        {razon ? (
          <Text className="text-[11px] leading-snug text-white/75" numberOfLines={2}>
            {razon}
          </Text>
        ) : null}
      </View>

      {/* Afinidad y rating, en una columna para no romper el ancho del texto */}
      <View className="items-end gap-1">
        <View className="flex-row items-center gap-1 rounded-full bg-white/20 px-2 py-0.5">
          <Icon as={Sparkles} className="text-yellow-300" size={11} fill="currentColor" />
          <Text className="text-[10px] font-bold text-white">{affinity}%</Text>
        </View>
        {rating_promedio !== null && rating_promedio !== undefined ? (
          <View className="flex-row items-center gap-0.5">
            <Icon as={Star} className="text-amber-300" size={11} fill="currentColor" />
            <Text className="text-[10px] font-bold text-white">
              {rating_promedio.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
