import { DefaultTheme, type Theme } from "expo-router";

/**
 * Tokens de la marca en HSL, espejo de `global.css` para poder usarlos
 * (deben ser strings completos) desde APIs que no aceptan clases de Tailwind,
 * como los temas de React Navigation.
 */
export const THEME = {
  light: {
    background: "hsl(210 40% 98%)",
    foreground: "hsl(217.2 32.6% 17.5%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(222.2 47.4% 11.2%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(222.2 47.4% 11.2%)",
    primary: "hsl(194.9 100% 48.8%)",
    primaryForeground: "hsl(222.2 47.4% 11.2%)",
    secondary: "hsl(210 40% 96.1%)",
    secondaryForeground: "hsl(222.2 47.4% 11.2%)",
    muted: "hsl(210 40% 96.1%)",
    mutedForeground: "hsl(215.4 16.3% 47%)",
    accent: "hsl(214.3 31.8% 91.4%)",
    accentForeground: "hsl(222.2 47.4% 11.2%)",
    destructive: "hsl(343.7 77.6% 50.6%)",
    border: "hsl(214.3 31.8% 91.4%)",
    input: "hsl(214.3 31.8% 91.4%)",
    ring: "hsl(194.9 100% 48.8%)",
    radius: "0.625rem",
    chart1: "hsl(194.9 100% 48.8%)",
    chart2: "hsl(267.3 72.3% 63.1%)",
    chart3: "hsl(215.4 16.3% 47%)",
    chart4: "hsl(24.6 95% 53.1%)",
    chart5: "hsl(160.1 84.1% 39.4%)",
  },
  // TODO: paleta oscura de la marca cuando la app soporte dark mode.
};

export const NAV_THEME: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: THEME.light.background,
    border: THEME.light.border,
    card: THEME.light.card,
    notification: THEME.light.destructive,
    primary: THEME.light.primary,
    text: THEME.light.foreground,
  },
};

/**
 * Paleta de degradados de la marca, con los colores ya resueltos a hex.
 *
 * NativeWind ignora `bg-gradient-*` / `from-*` / `to-*` en iOS y Android
 * (`background-image` no es una propiedad soportada por
 * `react-native-css-interop`), por eso los degradados usan `expo-linear-gradient`
 * a través de `BrandGradient` y necesitan strings completos, no clases.
 */
export const GRADIENTS = {
  /** cian oscuro -> morado, diagonal: banners y avatares */
  brand: ["#0096c7", "#9b5de5"],
  /** cian -> morado, horizontal: bloque de ilustración */
  brandSoft: ["#0096c7", "#00bbf9", "#9b5de5"],
  /** cian -> sky, diagonal: avatares */
  cyanToSky: ["#0096c7", "#38bdf8"],
  /** morado -> índigo, horizontal: botón primario del hero */
  purpleToIndigo: ["#9b5de5", "#3e41ee"],
  /** velo negro, vertical: overlay de legibilidad sobre fotos */
  scrim: ["rgba(0, 0, 0, 0.6)", "rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.8)"],
} as const satisfies Record<string, readonly [string, string, ...string[]]>;