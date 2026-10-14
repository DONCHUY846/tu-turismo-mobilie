const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// `inlineRem: 16` hace que 1rem de Tailwind equivalga a 16px en nativo.
module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });