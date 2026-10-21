import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react-native";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AvatarInput, type PickedImage } from "@/components/profile/AvatarInput";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { ApiError } from "@/lib/api";
import {
  extractUploadUrl,
  fetchProfile,
  updateProfile,
  uploadAvatar,
  type Profile,
} from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Pantalla "Editar perfil" (`/editar-perfil`).
 *
 * Guarda en `PUT /core/auth/me/`: nombre, apellido, correo y teléfono. La foto
 * se sube aparte a `POST /core/upload/` y la URL se manda en el mismo PUT.
 *
 * La contraseña también va en ese PUT, pero **el backend responde 500** al
 * recibirla (el serializer no llama `set_password`): hasta que se arregle del
 * lado del servidor, guardar con contraseña falla y no se aplica nada.
 */
export default function EditarPerfil() {
  const userId = useAuthStore((state) => state.user.id);

  const { data: profile, isPending, isError, error, refetch } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(),
  });

  if (isPending) {
    return (
      <Screen>
        <View className="gap-6 px-4 pt-6">
          <Skeleton className="h-28 w-28 self-center rounded-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </View>
      </Screen>
    );
  }

  if (isError || !profile) {
    return (
      <Screen>
        <View className="px-4 pt-6">
          <Text accessibilityRole="alert" className="text-sm text-destructive">
            {error instanceof ApiError
              ? (error.detail ?? error.message)
              : "No pudimos cargar tu perfil."}
          </Text>
          <Button
            variant="outline"
            onPress={() => void refetch()}
            className="mt-3 h-auto self-start rounded-lg border-brand-cyan px-3.5 py-1.5"
          >
            <Text className="text-xs font-medium text-brand-cyan">Reintentar</Text>
          </Button>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <PerfilForm profile={profile} />
    </Screen>
  );
}

/** Marco de la pantalla: cabecera con volver y scroll. */
function Screen({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="flex-row items-center gap-3 border-b border-border bg-card px-4"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-card active:opacity-70"
          >
            <Icon as={ChevronLeft} className="text-slate-600" size={20} />
          </Pressable>
          <Text className="text-lg font-bold tracking-tight text-foreground">
            Editar perfil
          </Text>
        </View>

        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Formulario de edición. Se monta cuando el perfil ya está cargado, así que
 * sus valores iniciales salen directo del perfil (sin efectos).
 */
function PerfilForm({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user.id);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [nombre, setNombre] = React.useState(profile.nombre ?? "");
  const [apellido, setApellido] = React.useState(profile.apellido ?? "");
  const [email, setEmail] = React.useState(profile.email ?? "");
  const [telefono, setTelefono] = React.useState(profile.telefono ?? "");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [picked, setPicked] = React.useState<PickedImage | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      // 1. Si hay foto nueva, primero se sube.
      let avatar: string | undefined;
      if (picked) {
        const uploaded = await uploadAvatar(picked);
        const url = extractUploadUrl(uploaded);
        if (!url) {
          throw new ApiError("El servidor no devolvió la URL de la imagen.");
        }
        avatar = url;
      }

      // 2. Y se manda todo en un solo PUT.
      return updateProfile({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        ...(avatar ? { avatar } : {}),
        ...(password ? { password } : {}),
      });
    },
    onSuccess: (updated) => {
      updateUser({ nombre: updated.nombre, email: updated.email });
      void queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      router.back();
    },
  });

  const validationError = validate({ email, password, confirmPassword });

  const errorMessage = save.isError
    ? save.error instanceof ApiError
      ? (save.error.detail ?? save.error.message)
      : "No pudimos guardar tus cambios. Inténtalo de nuevo."
    : validationError;

  const canSave =
    !save.isPending && !validationError && Boolean(nombre.trim());

  return (
    <View className="gap-6 px-4 pt-6">
      {/* Foto */}
      <AvatarInput
        avatarUrl={profile.avatar}
        name={[nombre, apellido].filter(Boolean).join(" ")}
        onChange={setPicked}
        disabled={save.isPending}
      />

      {/* Datos */}
      <View className="gap-4">
        <Field label="Nombre">
          <Input
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            autoCapitalize="words"
            autoComplete="name"
            editable={!save.isPending}
            className="h-12 rounded-xl"
          />
        </Field>

        <Field label="Apellido">
          <Input
            value={apellido}
            onChangeText={setApellido}
            placeholder="Tu apellido"
            autoCapitalize="words"
            autoComplete="name"
            editable={!save.isPending}
            className="h-12 rounded-xl"
          />
        </Field>

        <Field label="Correo electrónico">
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            editable={!save.isPending}
            className="h-12 rounded-xl"
          />
        </Field>

        <Field label="Teléfono">
          <Input
            value={telefono}
            onChangeText={setTelefono}
            placeholder="33 1234 5678"
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={!save.isPending}
            className="h-12 rounded-xl"
          />
        </Field>
      </View>

      {/* Contraseña */}
      <View className="gap-4">
        <Text className="text-sm font-bold text-slate-800">Contraseña</Text>

        <Field label="Nueva contraseña">
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Dejar vacío para no cambiarla"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            editable={!save.isPending}
            className="h-12 rounded-xl"
          />
        </Field>

        <Field label="Repetir contraseña">
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite la nueva contraseña"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            editable={!save.isPending}
            className="h-12 rounded-xl"
          />
        </Field>
      </View>

      {errorMessage ? (
        <Text
          accessibilityRole="alert"
          className="text-xs font-medium text-destructive"
        >
          {errorMessage}
        </Text>
      ) : null}

      <Button
        onPress={() => save.mutate()}
        disabled={!canSave}
        className="h-auto rounded-2xl bg-brand-navy py-3.5 active:opacity-80"
      >
        <Text className="text-sm font-semibold tracking-wide text-white">
          {save.isPending ? "Guardando…" : "Guardar cambios"}
        </Text>
      </Button>
    </View>
  );
}

/** Campo con su etiqueta, como en el formulario de login. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label}
      </Label>
      {children}
    </View>
  );
}

/** Validaciones de cliente (el backend no las hace). */
function validate({
  email,
  password,
  confirmPassword,
}: {
  email: string;
  password: string;
  confirmPassword: string;
}) {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "El correo no parece válido.";
  }
  if (password && password.length < 8) {
    return "La contraseña necesita al menos 8 caracteres.";
  }
  if (password && password !== confirmPassword) {
    return "Las contraseñas no coinciden.";
  }
  return null;
}
