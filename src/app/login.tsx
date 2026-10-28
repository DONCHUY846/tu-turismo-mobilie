import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react-native";
import * as React from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoginArtwork } from "@/components/auth/LoginArtwork";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api";
import { login } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Pantalla de acceso de Tu Turismo (`/login`).
 *
 * Bloques:
 *  1. Botón de regreso — vuelve a donde se entrée (Perfil).
 *  2. LoginArtwork  — ilustración de heritage de Jalisco.
 *  3. LoginSheet    — tarjeta con el título y `LoginForm`.
 *
 * El teclado se resuelve con `KeyboardAvoidingView` en iOS y con el
 * `softwareKeyboardLayoutMode: "resize"` de `app.json` en Android.
 * Está protegida por `Stack.Protected` en `_layout.tsx`: si ya hay sesión, el
 * router nunca deja llegar aquí.
 */
export default function Login() {
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((state) => state.signIn);
  // `reason=expired` lo manda el layout cuando la sesión se venció sola.
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const sessionExpired = reason === "expired";

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      signIn(session);
      router.replace("/");
    },
  });

  const errorMessage = loginMutation.isError
    ? loginMutation.error instanceof ApiError
      ? (loginMutation.error.detail ?? loginMutation.error.message)
      : "No pudimos iniciar sesión. Inténtalo de nuevo."
    : sessionExpired
      ? "Tu sesión expiró. Vuelve a iniciar sesión."
      : reason === "password-reset"
        ? "Tu contraseña se restableció. Inicia sesión con la nueva."
        : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Regreso */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          className="mb-3 h-9 w-9 items-center justify-center rounded-xl border border-border bg-card active:opacity-70"
        >
          <Icon as={ChevronLeft} className="text-slate-600" size={20} />
        </Pressable>

        {/* 2. Ilustración */}
        <LoginArtwork />

        {/* 3. Formulario */}
        <LoginSheet className="mt-4" title="Iniciar sesión">
          <LoginForm
            onSubmit={(values) => {
              loginMutation.reset();
              loginMutation.mutate(values);
            }}
            isPending={loginMutation.isPending}
            error={errorMessage}
          />
        </LoginSheet>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}