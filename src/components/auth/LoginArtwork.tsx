import { Sparkles } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { BrandGradient } from "@/components/BrandGradient";
import { JaliscoIllustration } from "@/components/auth/JaliscoIllustration";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { GRADIENTS } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type LoginArtworkProps = {
  cultureLabel?: string;
  cityLabel?: string;
  className?: string;
};

/**
 * Recuadro con la ilustración de heritage de Jalisco y sus etiquetas.
 * Es el bloque visual de la pantalla de login.
 */
export function LoginArtwork({
  cultureLabel = "Cultura · Tradición · Jalisco",
  cityLabel = "Guadalajara",
  className,
}: LoginArtworkProps) {
  return (
    <BrandGradient
      colors={GRADIENTS.brandSoft}
      direction="horizontal"
      className={cn(
        "relative h-32 w-full rounded-2xl border border-brand-cyan/20",
        className
      )}
    >
      <JaliscoIllustration />

      {/* Etiquetas sobre la ilustración */}
      <View className="absolute inset-x-0 bottom-0 flex-row items-center justify-between px-4 pb-2">
        <View className="flex-row items-center gap-1.5">
          <Icon as={Sparkles} className="text-brand-amber" size={14} fill="currentColor" />
          <Text className="text-[11px] font-semibold tracking-wide text-white">{cultureLabel}</Text>
        </View>
        <View className="rounded border border-white/25 bg-black/30 px-2 py-0.5">
          <Text className="text-[10px] font-bold uppercase text-white">{cityLabel}</Text>
        </View>
      </View>
    </BrandGradient>
  );
}