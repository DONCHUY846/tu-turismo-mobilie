import { Image } from "expo-image";
import { Menu } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type AppHeaderProps = {
  onPressMenu?: () => void;
  className?: string;
};

/** Alto del logotipo dentro de la barra (la imagen ya viene recortada). */
const LOGO_HEIGHT = 44;
const LOGO_ASPECT_RATIO = 2404 / 784;

/**
 * Barra superior de la app: logotipo de la marca a la izquierda y
 * acceso al menú a la derecha. Incluye el safe area superior.
 *
 * El logotipo es `tutu-header.png` (el lockup de `tutu.png` recortado a su
 * contenido visible): `expo-image` no tiene interop de NativeWind, por eso el
 * tamaño va en `style` y no en clases.
 */
export function AppHeader({ onPressMenu, className }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(
        "w-full border-b border-border bg-card px-4",
        "shadow-sm shadow-black/5",
        className
      )}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-16 flex-row items-center justify-between">
        <Image
          source={require("../../assets/tutu-header.png")}
          contentFit="contain"
          style={{
            height: LOGO_HEIGHT,
            aspectRatio: LOGO_ASPECT_RATIO,
          }}
          accessibilityRole="image"
          accessibilityLabel="Tu Turismo"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir menú"
          onPress={onPressMenu}
          className="rounded-lg p-2 active:bg-secondary"
        >
          <Icon as={Menu} className="text-muted-foreground" size={24} />
        </Pressable>
      </View>
    </View>
  );
}