import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, KeyRound } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { useController, useForm } from "react-hook-form";

import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  forgotPasswordCodeSchema,
  type ForgotPasswordCodeValues,
} from "@/lib/validators";
import { cn } from "@/lib/utils";

export type ForgotPasswordCodeFormProps = {
  /** se llama con el código ya validado y recortado */
  onSubmit: (values: ForgotPasswordCodeValues) => void;
  /** reenvía el código al correo (vuelve a llamar a `send-code`) */
  onResend: () => void;
  isPending?: boolean;
  isResending?: boolean;
  /** mensaje de error del backend, p. ej. "El código es incorrecto o ya fue utilizado." */
  error?: string;
};

/**
 * Paso 2 de la recuperación: el código que llegó al correo del usuario.
 *
 * La longitud del código la define el backend (el cliente solo valida que
 * haya algo escrito), así que el campo no impone `maxLength`.
 */
export function ForgotPasswordCodeForm({
  onSubmit,
  onResend,
  isPending = false,
  isResending = false,
  error,
}: ForgotPasswordCodeFormProps) {
  const { control, handleSubmit } = useForm<ForgotPasswordCodeValues>({
    resolver: zodResolver(forgotPasswordCodeSchema),
    defaultValues: { code: "" },
    mode: "onBlur",
  });

  const code = useController({ control, name: "code" });

  return (
    <View className="gap-y-4">
      <FormField
        label="Código"
        icon={KeyRound}
        error={code.fieldState.error?.message}
        inputProps={{
          value: code.field.value,
          onChangeText: code.field.onChange,
          onBlur: code.field.onBlur,
          nativeID: "recovery-code",
          placeholder: "Escribe el código",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "none",
          autoCorrect: false,
          autoComplete: "one-time-code",
          keyboardType: "number-pad",
          returnKeyType: "go",
          onSubmitEditing: handleSubmit(onSubmit),
        }}
      />

      <View className="flex-row items-center justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reenviar código"
          onPress={onResend}
          disabled={isResending || isPending}
          className="active:opacity-70"
        >
          <Text
            className={cn(
              "text-xs font-medium",
              isResending || isPending ? "text-slate-400" : "text-brand-terracotta"
            )}
          >
            {isResending ? "Reenviando…" : "¿No llegó? Reenviar código"}
          </Text>
        </Pressable>
      </View>

      {error ? (
        <Text accessibilityRole="alert" className="text-xs font-medium text-destructive">
          {error}
        </Text>
      ) : null}

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isPending || isResending}
        className="h-auto rounded-2xl border border-slate-800 bg-brand-navy py-3.5 shadow-lg shadow-slate-900/15 active:bg-slate-800"
      >
        <Text className="text-sm font-semibold tracking-wide text-white">
          {isPending ? "Verificando…" : "Verificar código"}
        </Text>
        {!isPending ? <Icon as={ChevronRight} className="text-brand-cyan" size={16} /> : null}
      </Button>
    </View>
  );
}
