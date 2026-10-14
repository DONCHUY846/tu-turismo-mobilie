import { WifiOff } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type OfflineBannerProps = {
  message?: string;
  /** TODO: cuando exista la capa de datos, `visible` debe reflejar el estado real de red
   *  (`@react-native-community/netinfo` / Expo Router `onlineManager`). */
  visible?: boolean;
  className?: string;
};

/**
 * Aviso de falta de conexión mostrado sobre el contenido.
 * TODO: conectar con el estado real de red y con el contenido cacheado.
 */
export function OfflineBanner({
  message = "Sin conexión — mostrando contenido guardado",
  visible = true,
  className,
}: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <View className={cn("flex-row items-center justify-center gap-2 bg-destructive px-4 py-2.5", className)}>
      <Icon as={WifiOff} className="text-white" size={16} />
      <Text className="text-xs font-medium text-white">{message}</Text>
    </View>
  );
}