import { LogOut, Settings } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type ProfileActionsProps = {
  /** TODO: conectar con la pantalla de configuración cuando exista. */
  onPressSettings?: () => void;
  /** se ejecuta cuando el usuario confirma en el diálogo */
  onSignOut: () => void;
  className?: string;
};

/**
 * Botones de la ficha de perfil: ajustes y cerrar sesión.
 *
 * Cerrar sesión pide confirmación: con el refresh automático de token, un
 * toque accidental significa volver a escribir la contraseña.
 */
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

      <AlertDialog>
        {/* `asChild` evita anidar dos pressables: el trigger toma el control. */}
        <AlertDialogTrigger asChild>
          <Action accessibilityLabel="Cerrar sesión" icon={LogOut} />
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a salir de Tu Turismo. Tendrás que volver a iniciar sesión para
              ver tus favoritos y tus recomendaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive active:bg-destructive/90"
              onPress={onSignOut}
            >
              <Text className="text-white">Cerrar sesión</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

/**
 * Botón cuadrado de la ficha de perfil.
 *
 * Reenvía el `ref` y las props extra (`aria-expanded`, `accessibilityState`…)
 * porque se usa como `asChild` del trigger del diálogo.
 */
const Action = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  {
    icon: typeof Settings;
    accessibilityLabel: string;
  } & Omit<React.ComponentProps<typeof Pressable>, "icon" | "accessibilityLabel">
>(function Action({ icon, accessibilityLabel, ...props }, ref) {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...props}
      className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-card active:opacity-70"
    >
      <Icon as={icon} className="text-slate-600" size={18} />
    </Pressable>
  );
});
