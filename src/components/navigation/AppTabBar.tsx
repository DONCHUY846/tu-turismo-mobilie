import type { BottomTabBarProps } from "expo-router/tabs";
import { Home } from "lucide-react-native";

import { BottomTabBar, type BottomTabItem } from "@/components/BottomTabBar";
import { BOTTOM_TABS } from "@/data/home";

/**
 * Tab bar del layout `(tabs)`: traduce las rutas del navegador de tabs a
 * nuestro `BottomTabBar` presentacional (iconos de lucide y colores de marca).
 */
export function AppTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const tabs: BottomTabItem[] = state.routes.map((route) => {
    const fromData = BOTTOM_TABS.find((tab) => tab.href === hrefForRoute(route.name));
    const options = descriptors[route.key]?.options;

    return {
      // el texto de la pestaña vive en el `title` del `Tabs.Screen`
      label: (options?.title as string | undefined) ?? fromData?.label ?? route.name,
      icon: fromData?.icon ?? Home,
      href: hrefForRoute(route.name),
    };
  });

  return (
    <BottomTabBar
      tabs={tabs}
      activeHref={hrefForRoute(state.routes[state.index]?.name ?? "index")}
      bottomInset={insets.bottom}
      onPressTab={(tab) => {
        const route = state.routes.find((item) => hrefForRoute(item.name) === tab.href);
        if (!route) return;

        const event = emitter.emit({
          type: "tabPress",
          target: route.key,
          canPreventDefault: true,
        });
        if (!event.defaultPrevented) navigateToTab(route.key);
      }}
    />
  );
}

/** Ruta del tab (`index`) → ruta de la app (`/`). */
function hrefForRoute(routeName: string) {
  return routeName === "index" ? "/" : `/${routeName}`;
}