import { RotateCw } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export type SectionErrorStateProps = {
  title?: string;
  /** detalle opcional: mensaje del error */
  detail?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

/**
 * Estado de error de una sección de la home: mensaje + botón para reintentar.
 * Es el estado que reemplaza a los skeletons cuando la petición falla.
 */
export function SectionErrorState({
  title = "No pudimos cargar el contenido",
  detail,
  onRetry,
  retryLabel = "Reintentar",
}: SectionErrorStateProps) {
  return (
    <View
      accessibilityRole="alert"
      className="items-center gap-3 rounded-2xl border border-border bg-card px-4 py-8"
    >
      <Text className="text-center text-sm font-semibold text-foreground">{title}</Text>
      {detail ? (
        <Text className="text-center text-xs text-muted-foreground">{detail}</Text>
      ) : null}
      <Button
        variant="outline"
        onPress={onRetry}
        className="h-auto rounded-lg border-brand-cyan px-3.5 py-1.5 active:bg-brand-cyan/10"
      >
        <Icon as={RotateCw} className="text-brand-cyan" size={14} />
        <Text className="text-xs font-medium text-brand-cyan">{retryLabel}</Text>
      </Button>
    </View>
  );
}