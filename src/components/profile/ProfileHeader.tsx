import { LogOut, Settings } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type ProfileHeaderProps = {
  onPressSettings?: () => void;
  /** si se pasa `undefined`, el botón de cerrar sesión no se renderiza */
  onSignOut?: () => void;
  className?: string;
};

/**
 * Cabecera con degradado de la pantalla de perfil: sobre este fondo se apoya la
 * tarjeta de usuario (que sube con margen negativo). Los colores del diseño
 * original (azul/índigo) se adaptan a los tokens de la marca.
 */
export function ProfileHeader({ onPressSettings, onSignOut, className }: ProfileHeaderProps) {
  return (
    <View
      className={cn(
        "bg-gradient-to-r from-brand-cyanHover via-brand-cyan to-brand-purple px-5 pb-28 pt-6",
        className
      )}
    >
      <View className="flex-row items-center justify-end gap-2.5">
        <HeaderAction
          accessibilityLabel="Configuración"
          onPress={onPressSettings ?? (() => {})}
          icon={Settings}
        />
        {onSignOut ? (
          <HeaderAction
            accessibilityLabel="Cerrar sesión"
            onPress={onSignOut}
            icon={LogOut}
          />
        ) : null}
      </View>
    </View>
  );
}

function HeaderAction({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: typeof Settings;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15 active:opacity-70"
    >
      <Icon as={icon} className="text-white" size={20} />
    </Pressable>
  );
}