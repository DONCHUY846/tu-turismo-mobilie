import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react-native";
import * as React from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoginArtwork } from "@/components/auth/LoginArtwork";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api";
import type { RegisterFormValues } from "@/lib/validators";
import { register } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Pantalla de alta de cuenta (`/registro`).
 *
 * Bloques:
 *  1. Botón de regreso — vuelve al login.
 *  2. LoginArtwork  — ilustración de heritage de Jalisco.
 *  3. LoginSheet    — tarjeta con el título y `RegisterForm`.
 *
 * El backend responde el mismo `LoginResponse` que el login, así que al
 * registrarse la sesión queda iniciada: se guarda y se entra a la app.
 */
export default function Registro() {
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((state) => state.signIn);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (session) => {
      signIn(session);
      router.replace("/");
    },
  });

  const handleSubmit = (values: RegisterFormValues) => {
    registerMutation.reset();
    // `confirmPassword` solo sirve para validar: no se manda al backend.
    const { confirmPassword: _confirmPassword, ...payload } = values;
    registerMutation.mutate(payload);
  };

  const errorMessage = registerMutation.isError
    ? registerMutation.error instanceof ApiError
      ? (registerMutation.error.detail ?? registerMutation.error.message)
      : "No pudimos crear tu cuenta. Inténtalo de nuevo."
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
        <LoginSheet className="mt-4" title="Crear cuenta">
          <RegisterForm
            onSubmit={handleSubmit}
            isPending={registerMutation.isPending}
            error={errorMessage}
          />
        </LoginSheet>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
