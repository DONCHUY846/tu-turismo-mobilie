import { WifiOff } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { useIsOnline } from "@/hooks/useIsOnline";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type OfflineBannerProps = {
  message?: string;
  /** mensaje cuando hay red pero no hay salida a internet */
  unreachableMessage?: string;
  className?: string;
};

/**
 * Aviso de falta de conexión, sincronizado con el estado real de red
 * (expo-network). Se desmonta solo cuando vuelve la conexión.
 */
export function OfflineBanner({
  message = "Sin conexión — mostrando contenido guardado",
  unreachableMessage = "Sin internet — mostrando contenido guardado",
  className,
}: OfflineBannerProps) {
  const { isOnline, isInternetReachable } = useIsOnline();

  if (isOnline && isInternetReachable) return null;

  return (
    <View
      accessibilityRole="alert"
      className={cn("flex-row items-center justify-center gap-2 bg-destructive px-4 py-2.5", className)}
    >
      <Icon as={WifiOff} className="text-white" size={16} />
      <Text className="text-xs font-medium text-white">
        {isOnline ? unreachableMessage : message}
      </Text>
    </View>
  );
}