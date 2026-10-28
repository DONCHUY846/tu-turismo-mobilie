import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Mail } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import { useController, useForm } from "react-hook-form";

import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  forgotPasswordEmailSchema,
  type ForgotPasswordEmailValues,
} from "@/lib/validators";

export type ForgotPasswordEmailFormProps = {
  /** se llama con el correo ya validado y normalizado */
  onSubmit: (values: ForgotPasswordEmailValues) => void;
  isPending?: boolean;
  /** mensaje de error del backend, p. ej. "No existe una cuenta registrada..." */
  error?: string;
};

/**
 * Paso 1 de la recuperación: el correo al que se manda el código.
 *
 * La validación la hace Zod (`forgotPasswordEmailSchema`), que reutiliza la
 * regla del correo del login. Los campos van con `useController` y **no**
 * `register` (ver `LoginForm`): en React Native el texto llega por
 * `onChangeText`.
 */
export function ForgotPasswordEmailForm({
  onSubmit,
  isPending = false,
  error,
}: ForgotPasswordEmailFormProps) {
  const { control, handleSubmit } = useForm<ForgotPasswordEmailValues>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const email = useController({ control, name: "email" });

  return (
    <View className="gap-y-4">
      <FormField
        label="Correo electrónico"
        icon={Mail}
        error={email.fieldState.error?.message}
        inputProps={{
          value: email.field.value,
          onChangeText: email.field.onChange,
          onBlur: email.field.onBlur,
          nativeID: "recovery-email",
          placeholder: "viajero@ejemplo.com",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "none",
          autoComplete: "email",
          autoCorrect: false,
          keyboardType: "email-address",
          returnKeyType: "go",
          onSubmitEditing: () => handleSubmit(onSubmit)(),
        }}
      />

      {error ? (
        <Text accessibilityRole="alert" className="text-xs font-medium text-destructive">
          {error}
        </Text>
      ) : null}

      <Button
        onPress={() => handleSubmit(onSubmit)()}
        disabled={isPending}
        className="h-auto rounded-2xl border border-slate-800 bg-brand-navy py-3.5 shadow-lg shadow-slate-900/15 active:bg-slate-800"
      >
        <Text className="text-sm font-semibold tracking-wide text-white">
          {isPending ? "Enviando código…" : "Enviar código"}
        </Text>
        {!isPending ? <Icon as={ChevronRight} className="text-brand-cyan" size={16} /> : null}
      </Button>
    </View>
  );
}
