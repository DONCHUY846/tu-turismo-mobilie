// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
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
