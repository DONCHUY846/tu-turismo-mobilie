import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type BottomTabItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export type BottomTabBarProps = {
  tabs: BottomTabItem[];
  /** href de la pestaña activa; la de marca es `text-brand-cyan` */
  activeHref?: string;
  onPressTab?: (tab: BottomTabItem) => void;
  /** inset inferior; si no se pasa se toma del safe area del contexto */
  bottomInset?: number;
  className?: string;
};

/**
 * Barra de navegación inferior (presentacional): recibe las pestañas ya resueltas.
 * Quien la monta es `AppTabBar`, el adaptador del `tabBar` de Expo Router.
 */
export function BottomTabBar({
  tabs,
  activeHref,
  onPressTab,
  bottomInset,
  className,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(
        "flex-row items-center justify-around border-t border-border bg-card px-6 py-2",
        "shadow-lg shadow-black/10",
        className
      )}
      style={{ paddingBottom: (bottomInset ?? insets.bottom) + 8 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.href === activeHref;
        return (
          <Pressable
            key={tab.href}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => onPressTab?.(tab)}
            className="items-center justify-center py-1 active:opacity-70"
          >
            <Icon
              as={tab.icon}
              className={isActive ? "text-brand-cyan" : "text-slate-400"}
              size={20}
            />
            <Text
              className={cn(
                "mt-0.5 text-[10px]",
                isActive ? "font-medium text-brand-cyan" : "text-slate-400"
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}