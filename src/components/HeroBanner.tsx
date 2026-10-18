import { Image, type ImageSource } from "expo-image";
import * as React from "react";
import { View } from "react-native";

import { BrandGradient } from "@/components/BrandGradient";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { GRADIENTS } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type HeroBannerProps = {
  /** imagen de fondo del hero */
  image: ImageSource;
  /** primer renglón del título */
  title: string;
  /** renglón destacado (color de marca) */
  highlight: string;
  subtitle?: string;
  /** CTA principal: botón sólido de marca */
  primaryLabel?: string;
  onPrimaryPress?: () => void;
  /** CTA secundario: botón con degradado */
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  className?: string;
};

/**
 * Banner principal de la home: imagen a pantalla completa con overlay oscuro,
 * titular, texto de apoyo y dos llamados a la acción.
 */
export function HeroBanner({
  image,
  title,
  highlight,
  subtitle,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  className,
}: HeroBannerProps) {
  return (
    <View className={cn("relative overflow-hidden bg-brand-dark", className)}>
      {/* TODO: sustituir la imagen hardcodeada por el asset final del hero. */}
      {/* Nota: `expo-image` no tiene interop de NativeWind, así que el contenedor
          usa clases (View sí lo tiene) y el tamaño de la imagen va por `style`. */}
      <View className="absolute inset-0">
        <Image
          source={image}
          contentFit="cover"
          style={{ width: "100%", height: "100%" }}
          accessibilityIgnoresInvertColors
        />
      </View>
      {/* Overlay para asegurar legibilidad del texto sobre cualquier foto */}
      <BrandGradient
        colors={GRADIENTS.scrim}
        direction="vertical"
        locations={[0, 0.5, 1]}
        className="absolute inset-0"
      />

      <View className="relative z-10 items-center px-6 pb-16 pt-16">
        <Text className="mb-4 text-center text-3xl font-extrabold leading-tight tracking-tight text-white">
          {title} {"\n"}
          <Text className="text-brand-cyan">{highlight}</Text>
        </Text>

        {subtitle ? (
          <Text className="mb-8 max-w-72 text-center text-sm font-normal leading-relaxed text-slate-200">
            {subtitle}
          </Text>
        ) : null}

        <View className="w-full max-w-72 items-center gap-3.5">
          {primaryLabel ? (
            <Button
              onPress={onPrimaryPress}
              className="h-auto w-full rounded-full bg-brand-cyan py-3.5 shadow-lg shadow-brand-cyan/20 active:bg-brand-cyanHover"
            >
              <Text className="text-sm font-semibold tracking-wide text-brand-dark">
                {primaryLabel}
              </Text>
            </Button>
          ) : null}

          {secondaryLabel ? (
            <BrandGradient
              colors={GRADIENTS.purpleToIndigo}
              direction="horizontal"
              className="w-full rounded-full shadow-lg shadow-brand-purple/20"
            >
              <Button
                onPress={onSecondaryPress}
                className="h-auto w-full rounded-full bg-transparent py-3.5 active:opacity-90"
              >
                <Text className="text-sm font-semibold tracking-wide text-white">
                  {secondaryLabel}
                </Text>
              </Button>
            </BrandGradient>
          ) : null}
        </View>
      </View>
    </View>
  );
}