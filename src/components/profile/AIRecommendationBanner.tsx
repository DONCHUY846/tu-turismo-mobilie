import { ArrowRight, RefreshCw, Sparkles } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { BrandGradient } from "@/components/BrandGradient";
import { RecommendationCard } from "@/components/profile/RecommendationCard";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { GRADIENTS } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { AIRecommendation } from "@/services/recommendations";

export type AIRecommendationBannerProps = {
  badge?: string;
  title: string;
  description: string;
  actionLabel?: string;
  /** etiqueta del botón mientras corre la petición */
  loadingActionLabel?: string;
  /** recomendaciones ya recibidas; se listan dentro del banner */
  recommendations?: AIRecommendation[];
  isLoading?: boolean;
  errorMessage?: string | null;
  /** confirmación del backend (el itinerario también llega por correo) */
  successMessage?: string;
  onPressAction?: () => void;
  onRetry?: () => void;
  className?: string;
};

/**
 * Bloque promocional del motor de recomendaciones por IA.
 *
 * Al presionar el botón pide las recomendaciones y las muestra inline en la
 * misma tarjeta. El componente no pide datos: recibe el estado desde la pantalla
 * (ver `src/app/(tabs)/perfil.tsx`).
 */
export function AIRecommendationBanner({
  badge = "Motor de Recomendaciones IA",
  title,
  description,
  actionLabel = "recibir recomendaciones personalizadas",
  loadingActionLabel = "Generando recomendaciones…",
  recommendations,
  isLoading = false,
  errorMessage,
  successMessage,
  onPressAction,
  onRetry,
  className,
}: AIRecommendationBannerProps) {
  const hasResults = Boolean(recommendations?.length);

  return (
    <BrandGradient
      colors={GRADIENTS.brand}
      direction="diagonal"
      className={cn("rounded-[28px] p-6 shadow-xl shadow-indigo-500/20", className)}
    >
      <View className="mb-4 self-start items-center gap-1.5 rounded-full border border-white/25 bg-white/20 px-3 py-1">
        <Icon as={Sparkles} className="text-yellow-300" size={14} fill="currentColor" />
        <Text className="text-[11px] font-bold uppercase tracking-wide text-white">{badge}</Text>
      </View>

      <Text className="mb-3 text-2xl font-black leading-snug tracking-tight text-white">
        {title}
      </Text>
      <Text className="text-sm leading-relaxed text-slate-100">{description}</Text>

      <View className="mt-4 flex-row items-center gap-3">
        <Button
          onPress={onPressAction}
          disabled={isLoading}
          accessibilityLabel={actionLabel}
          accessibilityState={{ busy: isLoading, disabled: isLoading }}
          className="h-auto shrink-0 rounded-xl bg-card px-4 py-2.5 shadow-md active:opacity-80"
        >
          <Text className="text-xs font-bold text-brand-purple">
            {isLoading ? loadingActionLabel : actionLabel}
          </Text>
          <Icon as={ArrowRight} className="text-brand-purple" size={16} />
        </Button>

        {errorMessage && onRetry ? (
          <Button
            onPress={onRetry}
            accessibilityLabel="Reintentar"
            className="h-auto shrink-0 rounded-xl border border-white/40 bg-transparent py-2.5 shadow-none active:bg-white/20"
          >
            <Icon as={RefreshCw} className="text-white" size={14} />
            <Text className="text-xs font-bold text-white">Reintentar</Text>
          </Button>
        ) : null}
      </View>

      {errorMessage ? (
        <Text className="mt-3 text-xs leading-relaxed text-red-100">{errorMessage}</Text>
      ) : null}

      {isLoading ? (
        <View className="mt-5 gap-2 border-t border-white/20 pt-4">
          {Array.from({ length: 3 }, (_, index) => (
            <View key={index} className="flex-row items-center gap-3 rounded-2xl p-2.5">
              <Skeleton className="h-14 w-14 shrink-0 rounded-xl bg-white/25" />
              <View className="flex-1 gap-1.5">
                <Skeleton className="h-3.5 w-3/5 rounded-md bg-white/25" />
                <Skeleton className="h-3 w-2/5 rounded-md bg-white/20" />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {!isLoading && !errorMessage && hasResults ? (
        <View className="mt-5 gap-2 border-t border-white/20 pt-4">
          <Text className="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/90">
            Tus recomendaciones · {recommendations?.length}
          </Text>

          {recommendations?.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
            />
          ))}

          {successMessage ? (
            <Text className="mt-1 text-[11px] leading-relaxed text-white/75">
              {successMessage}
            </Text>
          ) : null}
        </View>
      ) : null}

      {!isLoading && !errorMessage && !hasResults && successMessage ? (
        <Text className="mt-3 text-xs leading-relaxed text-white/85">{successMessage}</Text>
      ) : null}
    </BrandGradient>
  );
}
