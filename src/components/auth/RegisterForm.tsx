import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Eye, EyeOff, Lock, Mail, Phone, User, UserRound } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { useController, useForm } from "react-hook-form";

import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { registerSchema, type RegisterFormValues } from "@/lib/validators";

export type RegisterFormProps = {
  /** se llama con los datos ya validados y normalizados */
  onSubmit: (values: RegisterFormValues) => void;
  isPending?: boolean;
  /** mensaje de error del backend, p. ej. "El email ya está registrado." */
  error?: string;
};

/**
 * Formulario de alta: nombre, apellido, correo, teléfono y contraseña (con
 * su confirmación).
 *
 * La validación la hace Zod (`registerSchema`), que además normaliza el
 * correo y deja el teléfono solo con dígitos.
 *
 * Los campos usan `useController` y **no** `register`: `register` espera
 * eventos de web (`event.target.value`) y en React Native el texto llega en
 * `onChangeText`. Con `register`, RHF guardaba el evento como valor del campo
 * y todos los campos fallaban la validación.
 */
export function RegisterForm({ onSubmit, isPending = false, error }: RegisterFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const nombre = useController({ control, name: "nombre" });
  const apellido = useController({ control, name: "apellido" });
  const email = useController({ control, name: "email" });
  const telefono = useController({ control, name: "telefono" });
  const password = useController({ control, name: "password" });
  const confirmPassword = useController({ control, name: "confirmPassword" });

  return (
    <View className="gap-y-4">
      <FormField
        label="Nombre"
        icon={User}
        error={nombre.fieldState.error?.message}
        inputProps={{
          value: nombre.field.value,
          onChangeText: nombre.field.onChange,
          onBlur: nombre.field.onBlur,
          nativeID: "register-nombre",
          placeholder: "John",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "words",
          autoComplete: "name",
          returnKeyType: "next",
        }}
      />

      <FormField
        label="Apellido"
        icon={UserRound}
        error={apellido.fieldState.error?.message}
        inputProps={{
          value: apellido.field.value,
          onChangeText: apellido.field.onChange,
          onBlur: apellido.field.onBlur,
          nativeID: "register-apellido",
          placeholder: "Doe",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "words",
          autoComplete: "name",
          returnKeyType: "next",
        }}
      />

      <FormField
        label="Correo electrónico"
        icon={Mail}
        error={email.fieldState.error?.message}
        inputProps={{
          value: email.field.value,
          onChangeText: email.field.onChange,
          onBlur: email.field.onBlur,
          nativeID: "register-email",
          placeholder: "correo@ejemplo.com",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "none",
          autoComplete: "email",
          autoCorrect: false,
          keyboardType: "email-address",
          returnKeyType: "next",
        }}
      />

      <FormField
        label="Teléfono"
        icon={Phone}
        error={telefono.fieldState.error?.message}
        inputProps={{
          value: telefono.field.value,
          onChangeText: telefono.field.onChange,
          onBlur: telefono.field.onBlur,
          nativeID: "register-telefono",
          placeholder: "3317867062",
          placeholderTextColor: "#94a3b8",
          keyboardType: "phone-pad",
          autoComplete: "tel",
          returnKeyType: "next",
        }}
      />

      <FormField
        label="Contraseña"
        icon={Lock}
        error={password.fieldState.error?.message}
        inputProps={{
          value: password.field.value,
          onChangeText: password.field.onChange,
          onBlur: password.field.onBlur,
          nativeID: "register-password",
          placeholder: "Mínimo 8 caracteres",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "none",
          autoComplete: "new-password",
          secureTextEntry: !isPasswordVisible,
          returnKeyType: "next",
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

      <FormField
        label="Confirmar contraseña"
        icon={Lock}
        error={confirmPassword.fieldState.error?.message}
        inputProps={{
          value: confirmPassword.field.value,
          onChangeText: confirmPassword.field.onChange,
          onBlur: confirmPassword.field.onBlur,
          nativeID: "register-confirm-password",
          placeholder: "Repite tu contraseña",
          placeholderTextColor: "#94a3b8",
          autoCapitalize: "none",
          autoComplete: "new-password",
          secureTextEntry: !isPasswordVisible,
          returnKeyType: "go",
          onSubmitEditing: handleSubmit(onSubmit),
        }}
      />

      {error ? (
        <Text accessibilityRole="alert" className="text-xs font-medium text-destructive">
          {error}
        </Text>
      ) : null}

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
        className="h-auto rounded-2xl border border-slate-800 bg-brand-navy py-3.5 shadow-lg shadow-slate-900/15 active:bg-slate-800"
      >
        <Text className="text-sm font-semibold tracking-wide text-white">
          {isPending ? "Creando cuenta…" : "Crear cuenta"}
        </Text>
        {!isPending ? <Icon as={ChevronRight} className="text-brand-cyan" size={16} /> : null}
      </Button>
    </View>
  );
}
