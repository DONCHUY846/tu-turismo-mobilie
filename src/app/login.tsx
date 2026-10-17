import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHero } from "@/components/auth/LoginHero";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { ApiError } from "@/lib/api";
import { login } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Pantalla de acceso de Tu Turismo (`/login`).
 *
 * Bloques (diseño de Stitch "Tu Turismo - Login (Variante Editorial)"):
 *  1. LoginHero    — cabecera editorial con la ilustración de Jalisco.
 *  2. LoginSheet   — hoja blanca elevada con el título del formulario.
 *  3. LoginForm    — correo, contraseña y los botones de acceso/registro.
 *
 * Está protegida por `Stack.Protected` en `_layout.tsx`: si ya hay sesión, el
 * router nunca deja llegar aquí.
 */
export default function Login() {
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((state) => state.signIn);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      signIn(session);
      router.replace("/");
    },
  });

  const handleSubmit = () => {
    if (!email.trim() || !password) return;
    loginMutation.reset();
    loginMutation.mutate({ email: email.trim(), password });
  };

  const errorMessage = loginMutation.isError
    ? loginMutation.error instanceof ApiError
      ? (loginMutation.error.detail ?? loginMutation.error.message)
      : "No pudimos iniciar sesión. Inténtalo de nuevo."
    : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-editorial-night"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LoginHero
          title="Tu próxima aventura"
          highlight="comienza aquí"
          subtitle="Explora la magia cultural, el tequila de origen, la arquitectura histórica y la calidez tapatía."
        />

        <LoginSheet
          eyebrow="Acceso a viajeros"
          title="Iniciar sesión"
          subtitle="Continúa planificando tus rutas y experiencias en México."
        >
          <LoginForm
            email={email}
            password={password}
            onChangeEmail={setEmail}
            onChangePassword={setPassword}
            onSubmit={handleSubmit}
            isPending={loginMutation.isPending}
            error={errorMessage}
          />
        </LoginSheet>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
