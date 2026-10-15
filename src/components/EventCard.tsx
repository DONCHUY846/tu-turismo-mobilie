import { Image } from "expo-image";
import { CalendarDays, MapPin } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Event } from "@/services/events";

export type EventCardProps = {
  event: Event;
  imageHeight?: number;
  onPress?: (event: Event) => void;
  className?: string;
};

/**
 * Tarjeta de evento: imagen con badge, nombre, fecha y ciudad.
 * Los datos ausentes (imagen, fecha, municipio) no se renderizan.
 */
export function EventCard({ event, imageHeight = 176, onPress, className }: EventCardProps) {
  const hasImage = Boolean(event.imagen_url);
  const date = formatDateRange(event.fecha_inicio, event.fecha_fin || undefined);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={event.nombre}
      onPress={onPress ? () => onPress(event) : undefined}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/5",
        className
      )}
    >
      <View className="relative w-full bg-slate-900" style={{ height: imageHeight }}>
        {hasImage ? (
          <Image
            source={{ uri: event.imagen_url }}
            contentFit="cover"
            // `expo-image` no tiene interop de NativeWind: las dimensiones van por `style`.
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel={event.nombre}
            transition={200}
          />
        ) : null}
        <Badge className="absolute left-3 top-3 border-0 bg-brand-cyan px-2.5 py-0.5">
          <Text className="text-[11px] font-semibold text-white">Evento</Text>
        </Badge>
      </View>

      <View className="gap-y-1 p-4">
        <Text className="text-base font-bold leading-snug text-slate-900">{event.nombre}</Text>

        <View className="mt-1.5 gap-y-1">
          {date ? (
            <View className="flex-row items-center gap-2">
              <Icon as={CalendarDays} className="shrink-0 text-brand-cyan" size={14} />
              <Text className="flex-1 text-xs text-slate-500">{date}</Text>
            </View>
          ) : null}

          {event.municipio ? (
            <View className="flex-row items-center gap-2">
              <Icon as={MapPin} className="shrink-0 text-brand-cyan" size={14} />
              <Text className="flex-1 text-xs text-slate-500">{event.municipio}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}