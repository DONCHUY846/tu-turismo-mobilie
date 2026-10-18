import { LogOut, Settings } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type ProfileActionsProps = {
  /** TODO: conectar con la pantalla de configuración cuando exista. */
  onPressSettings?: () => void;
  onSignOut: () => void;
  className?: string;
};

/** Botones de la ficha de perfil: ajustes y cerrar sesión. */
export function ProfileActions({
  onPressSettings,
  onSignOut,
  className,
}: ProfileActionsProps) {
  return (
    <View className={cn("flex-row justify-end gap-2.5 px-4 pt-3", className)}>
      <Action
        accessibilityLabel="Configuración"
        onPress={onPressSettings ?? (() => {})}
        icon={Settings}
      />
      <Action accessibilityLabel="Cerrar sesión" onPress={onSignOut} icon={LogOut} />
    </View>
  );
}

function Action({
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
      className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-card active:opacity-70"
    >
      <Icon as={icon} className="text-slate-600" size={18} />
    </Pressable>
  );
}