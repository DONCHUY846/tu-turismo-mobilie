/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  // Rutas donde Metro puede encontrar clases de Tailwind.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // TODO: cargar Inter (@expo-google-fonts/inter) y mapearla aquí para
      // replicar la tipografía del diseño. Por ahora se usa la fuente del sistema.
      fontFamily: {
        sans: ["Inter", "System", "sans-serif"],
      },
      // Radios Derivados de --radius, como en shadcn/ui.
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Tokens semánticos de react-native-reusables (ver global.css).
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // Paleta propia de Tu Turismo.
        brand: {
          cyan: "hsl(var(--brand-cyan))",
          cyanHover: "hsl(var(--brand-cyan-hover))",
          purple: "hsl(var(--brand-purple))",
          purpleHover: "hsl(var(--brand-purple-hover))",
          dark: "hsl(var(--brand-dark))",
          footer: "hsl(var(--brand-footer))",
          navy: "hsl(var(--brand-navy))",
          terracotta: "hsl(var(--brand-terracotta))",
          amber: "hsl(var(--brand-amber))",
          sand: "hsl(var(--brand-sand))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};