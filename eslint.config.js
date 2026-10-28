// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Código vendido generado por `npx mapcn-rn` (copy-owned): se actualiza con
    // el CLI, no con el editor. Ignorarlo evita warnings del vendido y no rompe
    // los hashes del registry (mapcn-rn doctor/diff).
    files: ["src/components/ui/mapcn/**", "src/lib/mapcn/**"],
    rules: {
      "@typescript-eslint/array-type": "off",
    },
  },
  {
    rules: {
      // NativeWind: global.css lo resuelve Metro, no el resolver de Node.
      "import/no-unresolved": [
        "error",
        { ignore: ["\\.css$"] },
      ],
    },
  }
]);
