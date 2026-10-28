import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Eye, EyeOff, Lock, Mail, Phone, User, UserRound } from "lucide-react-native";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";
import { useController, useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AvatarInput, type PickedImage } from "@/components/profile/AvatarInput";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { ApiError } from "@/lib/api";
import { profileSchema, type ProfileFormValues } from "@/lib/validators";
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
 *
 * Usa los mismos esquemas Zod que el alta (`profileSchema`), con la
 * contraseña opcional: vacío = no cambiarla.
 */
function PerfilForm({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user.id);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [picked, setPicked] = React.useState<PickedImage | null>(null);

  const { control, handleSubmit } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: profile.nombre ?? "",
      apellido: profile.apellido ?? "",
      email: profile.email ?? "",
      telefono: profile.telefono ?? "",
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

  const save = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
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

      // 2. Y se manda todo en un solo PUT. La contraseña vacía no se manda.
      const { confirmPassword: _confirm, password: newPassword, ...fields } = values;
      return updateProfile({
        ...fields,
        ...(avatar ? { avatar } : {}),
        ...(newPassword ? { password: newPassword } : {}),
      });
    },
    onSuccess: (updated) => {
      updateUser({ nombre: updated.nombre, email: updated.email });
      void queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      router.back();
    },
  });

  const errorMessage = save.isError
    ? save.error instanceof ApiError
      ? (save.error.detail ?? save.error.message)
      : "No pudimos guardar tus cambios. Inténtalo de nuevo."
    : undefined;

  const passwordToggle = (
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
    <View className="gap-6 px-4 pt-6">
      {/* Foto */}
      <AvatarInput
        avatarUrl={profile.avatar}
        name={[profile.nombre, profile.apellido].filter(Boolean).join(" ")}
        onChange={setPicked}
        disabled={save.isPending}
      />

      {/* Datos */}
      <View className="gap-4">
        <FormField
          label="Nombre"
          icon={User}
          error={nombre.fieldState.error?.message}
          inputProps={{
            value: nombre.field.value,
            onChangeText: nombre.field.onChange,
            onBlur: nombre.field.onBlur,
            nativeID: "profile-nombre",
            placeholder: "Tu nombre",
            placeholderTextColor: "#94a3b8",
            autoCapitalize: "words",
            autoComplete: "name",
            editable: !save.isPending,
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
            nativeID: "profile-apellido",
            placeholder: "Tu apellido",
            placeholderTextColor: "#94a3b8",
            autoCapitalize: "words",
            autoComplete: "name",
            editable: !save.isPending,
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
            nativeID: "profile-email",
            placeholder: "correo@ejemplo.com",
            placeholderTextColor: "#94a3b8",
            autoCapitalize: "none",
            autoCorrect: false,
            keyboardType: "email-address",
            autoComplete: "email",
            editable: !save.isPending,
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
            nativeID: "profile-telefono",
            placeholder: "3317867062",
            placeholderTextColor: "#94a3b8",
            keyboardType: "phone-pad",
            autoComplete: "tel",
            editable: !save.isPending,
          }}
        />
      </View>

      {/* Contraseña */}
      <View className="gap-4">
        <Text className="text-sm font-bold text-slate-800">Contraseña</Text>

        <FormField
          label="Nueva contraseña"
          icon={Lock}
          error={password.fieldState.error?.message}
          accessory={passwordToggle}
          inputProps={{
            value: password.field.value,
            onChangeText: password.field.onChange,
            onBlur: password.field.onBlur,
            nativeID: "profile-password",
            placeholder: "Dejar vacío para no cambiarla",
            placeholderTextColor: "#94a3b8",
            autoCapitalize: "none",
            autoComplete: "new-password",
            secureTextEntry: !isPasswordVisible,
            editable: !save.isPending,
          }}
        />

        <FormField
          label="Repetir contraseña"
          icon={Lock}
          error={confirmPassword.fieldState.error?.message}
          accessory={passwordToggle}
          inputProps={{
            value: confirmPassword.field.value,
            onChangeText: confirmPassword.field.onChange,
            onBlur: confirmPassword.field.onBlur,
            nativeID: "profile-confirm-password",
            placeholder: "Repite la nueva contraseña",
            placeholderTextColor: "#94a3b8",
            autoCapitalize: "none",
            autoComplete: "new-password",
            secureTextEntry: !isPasswordVisible,
            editable: !save.isPending,
          }}
        />
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
        onPress={() => handleSubmit((values) => save.mutate(values))()}
        disabled={save.isPending}
        className="h-auto rounded-2xl bg-brand-navy py-3.5 active:opacity-80"
      >
        <Text className="text-sm font-semibold tracking-wide text-white">
          {save.isPending ? "Guardando…" : "Guardar cambios"}
        </Text>
      </Button>
    </View>
  );
}
