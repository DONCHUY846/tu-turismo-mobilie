import * as React from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type LoginSheetProps = {
  title: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Tarjeta blanca que contiene el formulario de acceso. Comparte los márgenes y
 * la tipografía del resto de pantallas.
 */
export function LoginSheet({ title, className, children }: LoginSheetProps) {
  return (
    <View
      className={cn(
        "w-full gap-5 rounded-2xl border border-border bg-card px-4 py-5 shadow-sm shadow-black/5",
        className
      )}
    >
      <Text className="text-xl font-bold tracking-tight text-foreground">{title}</Text>
      {children}
    </View>
  );
}