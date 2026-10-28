import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react-native";
import * as React from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoginArtwork } from "@/components/auth/LoginArtwork";
import { ForgotPasswordCodeForm } from "@/components/auth/ForgotPasswordCodeForm";
import { ForgotPasswordEmailForm } from "@/components/auth/ForgotPasswordEmailForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { ApiError } from "@/lib/api";
import type {
  ForgotPasswordCodeValues,
  ForgotPasswordEmailValues,
  ResetPasswordFormValues,
} from "@/lib/validators";
import { cn } from "@/lib/utils";
import {
  resetPassword,
  sendPasswordCode,
  verifyPasswordCode,
} from "@/services/auth";

/** Pasos de la recuperación, de `send-code` a `reset`. */
type Step = "email" | "code" | "reset";

/** Título de la tarjeta en cada paso. */
const STEP_TITLES: Record<Step, string> = {
  email: "Recuperar contraseña",
  code: "Verificar código",
  reset: "Nueva contraseña",
};

/** Mensajes de error genéricos, para los fallos que no dan detalle del backend. */
const STEP_FALLBACKS: Record<Step, string> = {
  email: "No pudimos enviar el código. Inténtalo de nuevo.",
  code: "No pudimos verificar el código. Inténtalo de nuevo.",
  reset: "No pudimos restablecer la contraseña. Inténtalo de nuevo.",
};

/**
 * Error de una mutación listo para presentarse: el `detail` del backend (que
 * para la recuperación viene en `message`) o el genérico del paso.
 */
function mutationError(
  mutation: { isError: boolean; error: unknown },
  fallback: string
): string | undefined {
  if (!mutation.isError) return undefined;
  return mutation.error instanceof ApiError
    ? (mutation.error.detail ?? mutation.error.message)
    : fallback;
}

/**
 * Pantalla de recuperación de contraseña (`/recuperar-contrasena`).
 *
 * Tres pasos dentro de la misma pantalla (`Stack.Protected` la mantiene solo
 * para invitados, junto con el login):
 *
 *  1. `email` — el correo; `POST /auth/password/send-code/`.
 *  2. `code`  — el código del correo; `POST /auth/password/verify-code/`.
 *  3. `reset` — la contraseña nueva; `POST /auth/password/reset/`.
 *
 * El correo y el código viven en el estado de la pantalla: cada formulario
 * pide los campos de su paso y la pantalla arma los payload. Al restablecer
 * regresa al login con `reason=password-reset` para avisar que ya cambió.
 *
 * El teclado se resuelve igual que en login: `KeyboardAvoidingView` en iOS y
 * `softwareKeyboardLayoutMode: "resize"` en Android. El botón de atrás del
 * Android (hardware/gesto) retrocede un paso con la misma lógica que el
 * chevron; el gesto de iOS desde el borde sí cierra la pantalla completa:
 * queda así a propósito, para no bloquear la salida nativa de la app.
 */
export default function RecuperarContrasena() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  // Cada código nuevo desmonta el formulario del paso 2 con una `key` nueva:
  // borra el código viejo que el usuario escribiera y sus errores.
  const [codeAttempt, setCodeAttempt] = React.useState(0);

  // Espejo del paso actual para las respuestas de mutaciones que aterrizan
  // tarde: si el usuario se salió del paso mientras la petición volaba, su
  // `onSuccess` ya no mueve la pantalla.
  const stepRef = React.useRef(step);
  React.useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const sendCode = useMutation({
    mutationFn: (values: ForgotPasswordEmailValues) => sendPasswordCode(values.email),
    onSuccess: (_data, values) => {
      // Un código recién mandado anula el error de un reenvío anterior.
      resend.reset();
      setEmail(values.email);
      setStep("code");
    },
  });

  const verify = useMutation({
    mutationFn: ({ code: newCode }: ForgotPasswordCodeValues) =>
      verifyPasswordCode({ email, code: newCode }),
    onSuccess: (_data, values) => {
      if (stepRef.current !== "code") return;
      setCode(values.code);
      setStep("reset");
    },
  });

  const reset = useMutation({
    mutationFn: ({ password }: ResetPasswordFormValues) =>
      resetPassword({ email, code, password }),
    onSuccess: () => {
      if (stepRef.current !== "reset") return;
      router.replace({ pathname: "/login", params: { reason: "password-reset" } });
    },
  });

  // Reenvía el código del paso 2 con el correo que ya validamos en el paso 1.
  const resend = useMutation({
    mutationFn: () => sendPasswordCode(email),
    onSuccess: () => {
      // El código anterior queda invalidado: se limpia paso y formulario.
      verify.reset();
      setCodeAttempt((attempt) => attempt + 1);
    },
  });

  const goBack = () => {
    if (step === "email") {
      router.back();
      return;
    }
    if (step === "code") {
      sendCode.reset();
      verify.reset();
      resend.reset();
      setStep("email");
      return;
    }
    reset.reset();
    setStep("code");
  };

  // El `ref` alimenta al listener del hardware, que se suscribe una sola vez;
  // la sincronía con el render más nuevo la hace este efecto (corre en cada
  // render, sin depender de nada).
  const goBackRef = React.useRef(goBack);
  React.useEffect(() => {
    goBackRef.current = goBack;
  });

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      goBackRef.current();
      return true;
    });
    return () => subscription.remove();
  }, []);

  const isBusy = sendCode.isPending || verify.isPending || resend.isPending || reset.isPending;

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
        {/* 1. Regreso (a la pantalla anterior o al paso anterior). Mientras una
            petición está en vuelo, el paso en curso tiene que quedarse
            quieto: sin esto, regresar a mitad de `verify` salta de paso sin
            contexto. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={goBack}
          disabled={isBusy}
          className={cn(
            "mb-3 h-9 w-9 items-center justify-center rounded-xl border border-border bg-card active:opacity-70",
            isBusy && "opacity-50"
          )}
        >
          <Icon as={ChevronLeft} className="text-slate-600" size={20} />
        </Pressable>

        {/* 2. Ilustración */}
        <LoginArtwork />

        {/* 3. Paso actual */}
        <LoginSheet className="mt-4" title={STEP_TITLES[step]}>
          {/* En el paso 2 recordamos a qué correo se mandó el código. */}
          {step === "code" ? (
            <Text className="text-xs text-slate-500">
              Enviamos un código a {email}. Escríbelo aquí para continuar.
            </Text>
          ) : null}

          {step === "email" ? (
            <ForgotPasswordEmailForm
              onSubmit={(values) => {
                sendCode.reset();
                sendCode.mutate(values);
              }}
              isPending={sendCode.isPending}
              error={mutationError(sendCode, STEP_FALLBACKS.email)}
            />
          ) : step === "code" ? (
            <ForgotPasswordCodeForm
              key={codeAttempt}
              onSubmit={(values) => {
                verify.reset();
                verify.mutate(values);
              }}
              onResend={() => resend.mutate()}
              isPending={verify.isPending}
              isResending={resend.isPending}
              error={
                mutationError(verify, STEP_FALLBACKS.code) ??
                mutationError(resend, STEP_FALLBACKS.email)
              }
            />
          ) : (
            <ResetPasswordForm
              onSubmit={(values) => {
                reset.reset();
                reset.mutate(values);
              }}
              isPending={reset.isPending}
              error={mutationError(reset, STEP_FALLBACKS.reset)}
            />
          )}
        </LoginSheet>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
