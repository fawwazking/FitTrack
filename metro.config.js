const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite ships a .wasm binary for its web target; Metro treats unknown
// extensions as source by default. Tell it to bundle as an asset instead.
config.resolver.assetExts.push("wasm");

module.exports = config;
