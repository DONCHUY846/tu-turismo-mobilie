/** @type {import("jest").Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    // lucide-react-native publica ESM (.mjs) para React Native; Jest 30 en
    // CommonJS no transforma .mjs con el preset. Se usa su build CJS.
    "^lucide-react-native$":
      "<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js",
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.expo/", "/dist/", "/coverage/"],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/services/**/*.ts",
    "src/stores/**/*.ts",
    "!src/lib/mapcn/**",
    "!src/lib/theme.ts",
  ],
  coverageDirectory: "coverage",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|lucide-react-native|@rn-primitives/.*|nativewind|react-native-css-interop|@maplibre/.*)",
  ],
};
