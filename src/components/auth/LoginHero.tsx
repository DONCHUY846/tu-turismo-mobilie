import { Menu, Sparkles } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "@/components/auth/BrandMark";
import { JaliscoIllustration } from "@/components/auth/JaliscoIllustration";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type LoginHeroProps = {
  /** línea 1 del titular */
  title: string;
  /** línea 2 del titular (itálica, color de marca) */
  highlight: string;
  subtitle?: string;
  /** chip de ciudades, ej. "Guadalajara · Tequila · Tlaquepaque" */
  placesLabel?: string;
  /** etiqueta sobre la ilustración */
  cultureLabel?: string;
  /** chip de la ciudad en la ilustración */
  cityLabel?: string;
  className?: string;
};

/**
 * Cabecera editorial de la pantalla de login: degradado de noche, marca, chip de
 * ciudades, titular en serif e ilustración de heritage de Jalisco.
 */
export function LoginHero({
  title,
  highlight,
  subtitle,
  placesLabel = "Guadalajara · Tequila · Tlaquepaque",
  cultureLabel = "Cultura · Tradición · Jalisco",
  cityLabel = "Guadalajara",
  className,
}: LoginHeroProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(
        "w-full overflow-hidden bg-gradient-to-b from-editorial-night via-editorial-deep to-editorial-mid",
        className
      )}
      style={{ paddingTop: insets.top + 20, paddingBottom: 28 }}
    >
      <View className="mb-6 flex-row items-center justify-between">
        <BrandMark />
        {/* TODO: abrir el menú lateral cuando exista. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir menú"
          onPress={() => {}}
          className="h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 active:opacity-70"
        >
          <Icon as={Menu} className="text-white" size={20} />
        </Pressable>
      </View>

      {/* Chip de ciudades */}
      <View className="mb-3 self-start items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1">
        <View className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
        <Text className="text-[11px] font-medium tracking-wide text-brand-cyan">{placesLabel}</Text>
      </View>

      {/* Titular editorial */}
      <Text className="mb-2 font-serif text-3xl font-extrabold leading-tight tracking-tight text-white">
        {title} <Text className="font-serif-italic text-brand-cyan">{highlight}</Text>
      </Text>

      {subtitle ? (
        <Text className="max-w-72 text-xs leading-relaxed text-slate-300">{subtitle}</Text>
      ) : null}

      {/* Ilustración */}
      <View className="relative mt-5 h-32 w-full overflow-hidden rounded-2xl border border-brand-cyan/20 bg-gradient-to-r from-editorial-mid via-editorial-mid/80 to-editorial-mid">
        <JaliscoIllustration />

        {/* Etiquetas sobre la ilustración */}
        <View className="absolute inset-x-0 bottom-0 flex-row items-center justify-between px-4 pb-2">
          <View className="flex-row items-center gap-1.5">
            <Icon as={Sparkles} className="text-brand-amber" size={14} fill="currentColor" />
            <Text className="text-[11px] font-semibold tracking-wide text-white">{cultureLabel}</Text>
          </View>
          <View className="rounded border border-brand-cyan/20 bg-black/40 px-2 py-0.5">
            <Text className="text-[10px] font-bold uppercase text-brand-cyan">{cityLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}