import { Layers, Menu } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type AppHeaderProps = {
  /** texto en color de marca, ej. "Tu" */
  accent?: string;
  /** texto restante de la marca, ej. "Turismo" */
  title?: string;
  onPressMenu?: () => void;
  className?: string;
};

/**
 * Barra superior de la app: logotipo de la marca a la izquierda y
 * acceso al menú a la derecha. Incluye el safe area superior.
 */
export function AppHeader({
  accent = "Tu",
  title = "Turismo",
  onPressMenu,
  className,
}: AppHeaderProps) {
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
        <View className="flex-row items-center gap-2">
          <Icon as={Layers} className="text-brand-cyan" size={28} />
          <Text className="text-xl font-bold tracking-tight text-foreground">
            <Text className="text-brand-cyan">{accent}</Text> {title}
          </Text>
        </View>

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