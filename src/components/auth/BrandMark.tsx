import { Sparkles } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type BrandMarkProps = {
  title?: string;
  tagline?: string;
  className?: string;
};

/** Logotipo compacto: cuadro con marca + nombre y lema. */
export function BrandMark({
  title = "Tu Turismo",
  tagline = "Jalisco Auténtico",
  className,
}: BrandMarkProps) {
  return (
    <View className={cn("flex-row items-center gap-2.5", className)}>
      <View className="h-9 w-9 items-center justify-center rounded-xl border border-brand-cyan/30 bg-gradient-to-br from-brand-cyan to-brand-cyanHover">
        <Icon as={Sparkles} className="text-white" size={20} fill="currentColor" />
      </View>
      <View>
        <Text className="text-lg font-bold leading-none tracking-tight text-white">{title}</Text>
        <Text className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-cyan">
          {tagline}
        </Text>
      </View>
    </View>
  );
}