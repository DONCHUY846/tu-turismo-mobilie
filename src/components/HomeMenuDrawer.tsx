import { ChevronRight, X, type LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/** Elemento del menú: un botón que lleva a una sección de la pantalla. */
export type HomeMenuLink = {
  key: string;
  label: string;
  icon: LucideIcon;
  /**
   * Ancla de la sección destino: `#lugares`, `#eventos`, etc.
   * `#top` vuelve al inicio del scroll.
   */
  anchor: string;
};

export type HomeMenuDrawerProps = {
  visible: boolean;
  items: HomeMenuLink[];
  onClose: () => void;
  /** Se llama al elegir un elemento, antes se debe cerrar el menú. */
  onSelect: (item: HomeMenuLink) => void;
};

/**
 * Menú lateral del header de la home: panel que entra desde la derecha con
 * accesos directos a las secciones de la misma pantalla.
 *
 * El botón de hamburguesa de `AppHeader` abre este panel; cada elemento hace
 * scroll a su sección (misma lógica que los enlaces del footer) y lo cierra.
 */
export function HomeMenuDrawer({
  visible,
  items,
  onClose,
  onSelect,
}: HomeMenuDrawerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row justify-end bg-black/50">
        {/* Fondo tocable: cierra el menú al tocar fuera del panel. */}
        <Pressable
          accessibilityLabel="Cerrar menú"
          accessibilityRole="button"
          onPress={onClose}
          className="flex-1"
        />

        <SafeAreaView edges={["top", "bottom"]} className="w-4/5 max-w-xs bg-card">
          <View className="h-full border-l border-border">
            <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
              <Text className="text-lg font-bold tracking-tight text-foreground">
                Menú
              </Text>
              <Pressable
                accessibilityLabel="Cerrar menú"
                accessibilityRole="button"
                onPress={onClose}
                className="rounded-lg p-2 active:bg-secondary"
              >
                <Icon as={X} className="text-muted-foreground" size={24} />
              </Pressable>
            </View>

            <View className="py-2">
              {items.map((item, index) => (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Ir a ${item.label}`}
                  onPress={() => onSelect(item)}
                  className={cn(
                    "flex-row items-center gap-3 px-4 py-3.5 active:bg-secondary",
                    index > 0 && "border-t border-border"
                  )}
                >
                  <Icon as={item.icon} className="text-brand-cyan" size={20} />
                  <Text className="flex-1 text-sm font-medium text-foreground">
                    {item.label}
                  </Text>
                  <Icon as={ChevronRight} className="text-muted-foreground" size={16} />
                </Pressable>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
