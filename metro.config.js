const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite ships a .wasm binary for its web target; Metro treats unknown
// extensions as source by default. Tell it to bundle as an asset instead.
config.resolver.assetExts.push("wasm");

// @expo-google-fonts ships .ttf files inside node_modules sub-packages.
// Metro's default sourceExts don't cover .ttf; tell it to treat as asset.
config.resolver.assetExts.push("ttf");

module.exports = config;
