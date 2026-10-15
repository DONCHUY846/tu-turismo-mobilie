import { Image } from "expo-image";
import { Clock, MapPin } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@/services/restaurants";

export type RestaurantCardProps = {
  restaurant: Restaurant;
  imageHeight?: number;
  onPress?: (restaurant: Restaurant) => void;
  onPressMore?: (restaurant: Restaurant) => void;
  className?: string;
};

/**
 * Tarjeta de restaurante: imagen con badge, nombre, descripción,
 * dirección y horario.
 */
export function RestaurantCard({
  restaurant,
  imageHeight = 176,
  onPress,
  onPressMore,
  className,
}: RestaurantCardProps) {
  const hasImage = Boolean(restaurant.imagen_url);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={restaurant.nombre}
      onPress={onPress ? () => onPress(restaurant) : undefined}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/5",
        className
      )}
    >
      <View className="relative w-full bg-slate-200" style={{ height: imageHeight }}>
        {hasImage ? (
          <Image
            source={{ uri: restaurant.imagen_url }}
            contentFit="cover"
            // `expo-image` no tiene interop de NativeWind: las dimensiones van por `style`.
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel={restaurant.nombre}
            transition={200}
          />
        ) : null}
        <Badge className="absolute left-3 top-3 rounded-md border-0 bg-white/95 px-2.5 py-1 shadow-sm">
          <Text className="text-xs font-medium text-slate-700">Restaurante</Text>
        </Badge>
      </View>

      <View className="gap-y-1 p-4">
        <Text className="text-base font-bold leading-snug text-slate-900">{restaurant.nombre}</Text>

        {restaurant.descripcion ? (
          <Text className="mt-0.5 text-xs leading-relaxed text-slate-500">
            {restaurant.descripcion}
          </Text>
        ) : null}

        <View className="mt-1.5 gap-y-1">
          {restaurant.direccion ? (
            <View className="flex-row items-center gap-1.5">
              <Icon as={MapPin} className="shrink-0 text-slate-400" size={14} />
              <Text className="flex-1 text-[11px] text-slate-500" numberOfLines={1}>
                {restaurant.direccion}
              </Text>
            </View>
          ) : null}

          {restaurant.horario ? (
            <View className="flex-row items-center gap-1.5">
              <Icon as={Clock} className="shrink-0 text-brand-cyan" size={14} />
              <Text className="flex-1 text-[11px] text-brand-cyan">{restaurant.horario}</Text>
            </View>
          ) : null}
        </View>

        {/* TODO: llevar a la pantalla de detalle del restaurante. */}
        <View className="mt-3 flex-row justify-end">
          <Button
            variant="outline"
            onPress={onPressMore ? () => onPressMore(restaurant) : undefined}
            className="h-auto rounded-lg border-brand-cyan bg-transparent px-3.5 py-1.5 active:bg-brand-cyan/10"
          >
            <Text className="text-xs font-medium text-brand-cyan">Ver más</Text>
          </Button>
        </View>
      </View>
    </Pressable>
  );
}