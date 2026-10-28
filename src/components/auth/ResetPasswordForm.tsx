import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Eye, EyeOff, Lock } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { useController, useForm } from "react-hook-form";

import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validators";

export type ResetPasswordFormProps = {
  /** se llama con los datos ya validados */
  onSubmit: (values: ResetPasswordFormValues) => void;
  isPending?: boolean;
  /** mensaje de error del backend, p. ej. "El código es incorrecto o ya fue utilizado." */
  error?: string;
};

/**
 * Paso 3 de la recuperación: la contraseña nueva con su confirmación.
 *
 * El correo y el código verificado los maneja la pantalla: el formulario solo
 * pide los campos de este paso. Las reglas son las del alta
 * (`resetPasswordSchema`, mínimo 8 caracteres).
 */
export function ResetPasswordForm({ onSubmit, isPending = false, error }: ResetPasswordFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const password = useController({ control, name: "password" });
  const confirmPassword = useController({ control, name: "confirmPassword" });

  const visibilityAccessory = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
      onPress={() => setIsPasswordVisible((visible) => !visible)}
      className="p-1 active:opacity-60"
    >
      <Icon as={isPasswordVisible ? EyeOff : Eye} className="text-slate-400" size={20} />
    </Pressable>
  );

  return (
    <View className="gap-y-4">
      <FormField
        label="Nueva contraseña"
        icon={Lock}
        error={password.fieldState.error?.message}
        inputProps={{
          value: password.field.value,
          onChangeText: password.field.onChange,
          onBlur: password.field.onBlur,
          nativeID: "recovery-password",
          placeholder: "Mínimo 8 caracteres",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "none",
          autoComplete: "new-password",
          secureTextEntry: !isPasswordVisible,
          returnKeyType: "next",
        }}
        accessory={visibilityAccessory}
      />

      <FormField
        label="Confirmar contraseña"
        icon={Lock}
        error={confirmPassword.fieldState.error?.message}
        inputProps={{
          value: confirmPassword.field.value,
          onChangeText: confirmPassword.field.onChange,
          onBlur: confirmPassword.field.onBlur,
          nativeID: "recovery-confirm-password",
          placeholder: "Repite tu contraseña",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "none",
          autoComplete: "new-password",
          secureTextEntry: !isPasswordVisible,
          returnKeyType: "go",
          onSubmitEditing: () => handleSubmit(onSubmit)(),
        }}
        accessory={visibilityAccessory}
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
          {isPending ? "Restableciendo…" : "Restablecer contraseña"}
        </Text>
        {!isPending ? <Icon as={ChevronRight} className="text-brand-cyan" size={16} /> : null}
      </Button>
    </View>
  );
}
