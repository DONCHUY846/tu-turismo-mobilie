import * as React from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type LoginSheetProps = {
  /** etiqueta superior, ej. "Acceso a viajeros" */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Hoja blanca elevada que emerge del hero (con asa) y contiene el formulario.
 * Es el contenedor de la parte inferior de la pantalla de login.
 */
export function LoginSheet({ eyebrow, title, subtitle, className, children }: LoginSheetProps) {
  return (
    <View className={cn("-mt-6 w-full rounded-t-3xl border-t border-border bg-card", className)}>
      {/* Asa */}
      <View className="flex-row justify-center pb-1 pt-3">
        <View className="h-1.5 w-12 rounded-full bg-slate-200" />
      </View>

      <View className="px-6 pb-8 pt-4">
        <View className="mb-6">
          {eyebrow ? (
            <Text className="text-[11px] font-bold uppercase tracking-wider text-brand-cyan">
              {eyebrow}
            </Text>
          ) : null}
          <Text className="mt-0.5 font-serif text-2xl font-bold tracking-tight text-brand-navy">
            {title}
          </Text>
          {subtitle ? <Text className="mt-1 text-xs text-slate-500">{subtitle}</Text> : null}
        </View>

        {children}
      </View>
    </View>
  );
}