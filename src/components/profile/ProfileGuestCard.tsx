import { LogIn } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type ProfileGuestCardProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onPressSignIn: () => void;
  /** contenido opcional debajo del botón (ej. "Crear cuenta" en TODO) */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Estado invitado de la pantalla de perfil. No existe en el diseño de Stitch:
 * la única forma de llegar al login es desde aquí, así que esta tarjeta invita
 * a iniciar sesión.
 */
export function ProfileGuestCard({
  title = "Inicia sesión en Tu Turismo",
  description = "Entra con tu cuenta para guardar lugares favoritos, seguir tus eventos y recibir itinerarios a la medida.",
  actionLabel = "Iniciar sesión",
  onPressSignIn,
  children,
  className,
}: ProfileGuestCardProps) {
  return (
    <View className={cn("gap-4", className)}>
      <View className="items-center gap-3 rounded-2xl border border-border bg-card px-6 py-6">
        <View className="h-20 w-20 items-center justify-center rounded-full border-[3px] border-brand-cyan bg-gradient-to-tr from-brand-cyanHover to-sky-400">
          <Icon as={LogIn} className="text-white" size={30} />
        </View>

        <View className="h-1.5 w-9 rounded-full bg-brand-cyan" />

        <Text className="text-center text-xl font-bold tracking-tight text-slate-900">
          {title}
        </Text>
        <Text className="text-center text-sm leading-relaxed text-slate-500">
          {description}
        </Text>
      </View>

      <Button
        onPress={onPressSignIn}
        className="h-auto rounded-2xl bg-brand-navy py-3.5 active:opacity-80"
      >
        <Text className="text-sm font-semibold tracking-wide text-white">{actionLabel}</Text>
      </Button>

      {/* TODO: botón de "Crear cuenta" con POST /core/auth/register/. */}
      {children}
    </View>
  );
}