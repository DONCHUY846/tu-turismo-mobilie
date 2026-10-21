import * as React from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type FormFieldProps = {
  label: string;
  /** ícono del campo (de `lucide-react-native`) */
  icon: React.ComponentProps<typeof Icon>["as"];
  /** props del input (incluye `onChange`, `value`, `ref`… de RHF) */
  inputProps: React.ComponentProps<typeof Input>;
  /** contenido extra dentro del grupo, p. ej. el botón de ver la contraseña */
  accessory?: React.ReactNode;
  /** mensaje de error de validación */
  error?: string;
  className?: string;
};

/**
 * Campo de formulario de los formularios de auth: etiqueta, ícono, input y el
 * error de validación debajo.
 */
export function FormField({
  label,
  icon,
  inputProps,
  accessory,
  error,
  className,
}: FormFieldProps) {
  return (
    <View className={cn("gap-1.5", className)}>
      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label}
      </Label>

      <View
        className={cn(
          "flex-row items-center gap-2 rounded-2xl border pl-3.5 pr-3",
          error ? "border-destructive bg-red-50" : "border-slate-200 bg-brand-sand"
        )}
      >
        <Icon as={icon} className="shrink-0 text-brand-cyan" size={20} />
        <Input
          // El `Input` base trae su propio borde/fondo: aquí manda el del grupo.
          className="h-12 flex-1 border-0 bg-transparent pl-0 pr-0 text-sm text-slate-900 shadow-none sm:h-12"
          {...inputProps}
        />
        {accessory}
      </View>

      {error ? (
        <Text accessibilityRole="alert" className="text-xs font-medium text-destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
