import { ChevronRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

export type LoginFormProps = {
  email: string;
  password: string;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
  /** mensaje de error del backend, p. ej. "El email o la contraseña son incorrectos." */
  error?: string;
};

/**
 * Formulario de acceso: correo, contraseña con toggle de visibilidad, enlace de
 * recuperación y los botones de entrada y registro.
 */
export function LoginForm({
  email,
  password,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  isPending = false,
  error,
}: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const canSubmit = email.trim().length > 0 && password.length > 0 && !isPending;

  return (
    <View className="gap-y-4">
      {/* Correo electrónico */}
      <View>
        <Label
          nativeID="login-email"
          className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Correo electrónico
        </Label>
        <View className="flex-row items-center gap-2 rounded-2xl border border-slate-200 bg-brand-sand pl-3.5 pr-3">
          <Icon as={Mail} className="shrink-0 text-brand-cyan" size={20} />
          <Input
            nativeID="login-email"
            value={email}
            onChangeText={onChangeEmail}
            placeholder="viajero@ejemplo.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            returnKeyType="next"
            // el Input base trae su propio borde/fondo: aquí manda el del grupo
            className="h-12 flex-1 border-0 bg-transparent pl-0 pr-0 text-sm text-slate-900 shadow-none sm:h-12"
          />
        </View>
      </View>

      {/* Contraseña */}
      <View>
        <View className="mb-1.5 flex-row items-center justify-between">
          <Label
            nativeID="login-password"
            className="text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            Contraseña
          </Label>
          {/* TODO: el backend no expone recuperación de contraseña. */}
          <Pressable accessibilityRole="link" onPress={() => {}} className="active:opacity-70">
            <Text className="text-xs font-medium text-brand-terracotta">
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2 rounded-2xl border border-slate-200 bg-brand-sand pl-3.5 pr-3">
          <Icon as={Lock} className="shrink-0 text-brand-cyan" size={20} />
          <Input
            nativeID="login-password"
            value={password}
            onChangeText={onChangePassword}
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={canSubmit ? onSubmit : undefined}
            className="h-12 flex-1 border-0 bg-transparent pl-0 pr-0 text-sm text-slate-900 shadow-none sm:h-12"
          />
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
        </View>
      </View>

      {error ? (
        <Text accessibilityRole="alert" className="text-xs font-medium text-destructive">
          {error}
        </Text>
      ) : null}

      {/* Acciones */}
      <View className="gap-y-2.5 pt-1">
        <Button
          onPress={onSubmit}
          disabled={!canSubmit}
          className="h-auto rounded-2xl border border-slate-800 bg-brand-navy py-3.5 shadow-lg shadow-slate-900/15 active:bg-slate-800"
        >
          <Text className="text-sm font-semibold tracking-wide text-white">
            {isPending ? "Iniciando sesión…" : "Iniciar sesión"}
          </Text>
          {!isPending ? <Icon as={ChevronRight} className="text-brand-cyan" size={16} /> : null}
        </Button>

        {/* TODO: implementar con POST /core/auth/register/ cuando se documente el body. */}
        <Button
          variant="outline"
          onPress={() => {}}
          className="h-auto rounded-2xl border border-brand-cyan/25 bg-brand-cyan/10 py-3.5 active:bg-brand-cyan/20"
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