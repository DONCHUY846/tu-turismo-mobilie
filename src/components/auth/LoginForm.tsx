import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { useController, useForm } from "react-hook-form";
import { router } from "expo-router";

import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { loginSchema, type LoginFormValues } from "@/lib/validators";

export type LoginFormProps = {
  /** se llama con los datos ya validados y normalizados */
  onSubmit: (values: LoginFormValues) => void;
  isPending?: boolean;
  /** mensaje de error del backend, p. ej. "El email o la contraseña son incorrectos." */
  error?: string;
};

/**
 * Formulario de acceso: correo, contraseña con toggle de visibilidad, enlace
 * de recuperación y los botones de entrada y registro.
 *
 * La validación la hace Zod (`loginSchema`): no se llama al backend hasta que
 * el formulario es válido.
 *
 * Los campos usan `useController` y **no** `register`: `register` espera
 * eventos de web (`event.target.value`) y en React Native el texto llega en
 * `onChangeText`. Con `register`, RHF guardaba el evento como valor del campo
 * y todos los campos fallaban la validación.
 */
export function LoginForm({ onSubmit, isPending = false, error }: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const email = useController({ control, name: "email" });
  const password = useController({ control, name: "password" });

  return (
    <View className="gap-y-4">
      {/* Correo electrónico */}
      <FormField
        label="Correo electrónico"
        icon={Mail}
        error={email.fieldState.error?.message}
        inputProps={{
          value: email.field.value,
          onChangeText: email.field.onChange,
          onBlur: email.field.onBlur,
          nativeID: "login-email",
          placeholder: "viajero@ejemplo.com",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "none",
          autoComplete: "email",
          autoCorrect: false,
          returnKeyType: "next",
        }}
      />

      {/* Contraseña */}
      <FormField
        label="Contraseña"
        icon={Lock}
        error={password.fieldState.error?.message}
        inputProps={{
          value: password.field.value,
          onChangeText: password.field.onChange,
          onBlur: password.field.onBlur,
          nativeID: "login-password",
          placeholder: "••••••••",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "none",
          autoComplete: "current-password",
          returnKeyType: "go",
          onSubmitEditing: handleSubmit(onSubmit),
          secureTextEntry: !isPasswordVisible,
        }}
        accessory={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            className="p-1 active:opacity-60"
          >
            <Icon
              as={isPasswordVisible ? EyeOff : Eye}
              className="text-slate-400"
              size={20}
            />
          </Pressable>
        }
      />

      <View className="flex-row items-center justify-end">
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push("/recuperar-contrasena")}
          className="active:opacity-70"
        >
          <Text className="text-xs font-medium text-brand-terracotta">
            ¿Olvidaste tu contraseña?
          </Text>
        </Pressable>
      </View>

      {error ? (
        <Text accessibilityRole="alert" className="text-xs font-medium text-destructive">
          {error}
        </Text>
      ) : null}

      {/* Acciones */}
      <View className="gap-y-2.5 pt-1">
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          className="h-auto rounded-2xl border border-slate-800 bg-brand-navy py-3.5 shadow-lg shadow-slate-900/15 active:bg-slate-800"
        >
          <Text className="text-sm font-semibold tracking-wide text-white">
            {isPending ? "Iniciando sesión…" : "Iniciar sesión"}
          </Text>
          {!isPending ? <Icon as={ChevronRight} className="text-brand-cyan" size={16} /> : null}
        </Button>

        <Button
          variant="outline"
          onPress={() => router.push("/registro")}
          className="h-auto rounded-2xl border-brand-cyan/25 bg-brand-cyan/10 py-3.5 active:bg-brand-cyan/20"
        >
          <Text className="text-sm font-semibold tracking-wide text-brand-cyanHover">
            Crear cuenta nueva
          </Text>
        </Button>
      </View>

      {/* Nota de confianza */}
      <View className="mt-1 flex-row items-center justify-center gap-2 border-t border-border pt-5">
        <Icon as={ShieldCheck} className="text-brand-cyan" size={16} />
        <Text className="text-xs text-slate-400">Conexión segura y reservas verificadas</Text>
      </View>
    </View>
  );
}
