import { ArrowRight, Sparkles } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type AIRecommendationBannerProps = {
  badge?: string;
  title: string;
  description: string;
  actionLabel?: string;
  /** TODO: conectar con el endpoint de itinerarios cuando exista. */
  onPressAction?: () => void;
  className?: string;
};

/** Bloque promocional del motor de recomendaciones por IA. */
export function AIRecommendationBanner({
  badge = "Motor de Recomendaciones IA",
  title,
  description,
  actionLabel = "Generar Itinerario",
  onPressAction,
  className,
}: AIRecommendationBannerProps) {
  return (
    <View
      className={cn(
        "overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-cyanHover to-brand-purple p-6 shadow-xl shadow-indigo-500/20",
        className
      )}
    >
      <View className="mb-4 self-start items-center gap-1.5 rounded-full border border-white/25 bg-white/20 px-3 py-1">
        <Icon as={Sparkles} className="text-yellow-300" size={14} fill="currentColor" />
        <Text className="text-[11px] font-bold uppercase tracking-wide text-white">{badge}</Text>
      </View>

      <Text className="mb-3 text-2xl font-black leading-snug tracking-tight text-white">
        {title}
      </Text>
      <Text className="mb-4 text-sm leading-relaxed text-slate-100">{description}</Text>

      <Button
        onPress={onPressAction}
        className="h-auto self-start rounded-xl bg-card px-4 py-2.5 shadow-md active:opacity-80"
      >
        <Text className="text-xs font-bold text-brand-purple">{actionLabel}</Text>
        <Icon as={ArrowRight} className="text-brand-purple" size={16} />
      </Button>
    </View>
  );
}