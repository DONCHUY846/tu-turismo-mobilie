import { Image } from "expo-image";
import { MapPin, Star } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { Place } from "@/services/places";

export type PlaceCardProps = {
  place: Place;
  /** alto de la imagen en px (176 en el diseño) */
  imageHeight?: number;
  onPress?: (place: Place) => void;
  onPressMore?: (place: Place) => void;
  className?: string;
};

/**
 * Tarjeta de lugar: imagen con badge de categoría, nombre con rating,
 * descripción, dirección y el botón "Ver más".
 *
 * Los datos incompletos (sin categoría, rating, descripción o dirección)
 * simplemente no se renderizan, para no dejar huecos en la card.
 */
export function PlaceCard({
  place,
  imageHeight = 176,
  onPress,
  onPressMore,
  className,
}: PlaceCardProps) {
  const rating = place.rating_promedio ?? place.calificacion;
  const hasImage = Boolean(place.imagen_url);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={place.nombre}
      onPress={onPress ? () => onPress(place) : undefined}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/5",
        className
      )}
    >
      {/* Imagen del lugar; si la API no trae imagen se muestra un bloque neutro */}
      <View className="relative w-full bg-slate-200" style={{ height: imageHeight }}>
        {hasImage ? (
          <Image
            source={{ uri: place.imagen_url }}
            contentFit="cover"
            // `expo-image` no tiene interop de NativeWind: las dimensiones van por `style`.
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel={place.nombre}
            transition={200}
          />
        ) : null}
        {place.categoria ? (
          <Badge className="absolute left-3 top-3 rounded-md border-0 bg-white/95 px-2.5 py-1 shadow-sm">
            <Text className="text-xs font-medium text-slate-700">{place.categoria}</Text>
          </Badge>
        ) : null}
      </View>

      <View className="gap-y-1 p-4">
        {/* Nombre + rating */}
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 text-base font-bold leading-snug text-slate-900">
            {place.nombre}
          </Text>
          {rating !== null && rating !== undefined ? (
            <View className="flex-row items-center gap-0.5">
              <Icon as={Star} className="text-amber-500" size={12} fill="currentColor" />
              <Text className="text-xs font-bold text-amber-500">{rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>

        {place.descripcion ? (
          <Text className="text-xs leading-relaxed text-slate-500" numberOfLines={2}>
            {place.descripcion}
          </Text>
        ) : null}

        {place.direccion ? (
          <View className="mt-1.5 flex-row items-center gap-1.5">
            <Icon as={MapPin} className="shrink-0 text-slate-400" size={14} />
            <Text className="flex-1 text-[11px] text-slate-500" numberOfLines={1}>
              {place.direccion}
            </Text>
          </View>
        ) : null}

        {/* TODO: llevar a la pantalla de detalle del lugar (`/lugares/[id]`). */}
        <View className="mt-3 flex-row justify-end">
          <Button
            variant="outline"
            onPress={onPressMore ? () => onPressMore(place) : undefined}
            className="h-auto rounded-lg border-brand-cyan bg-transparent px-3.5 py-1.5 active:bg-brand-cyan/10"
          >
            <Text className="text-xs font-medium text-brand-cyan">Ver más</Text>
          </Button>
        </View>
      </View>
    </Pressable>
  );
}