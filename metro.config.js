const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});
config.resolver.sourceExts.push('json'); 

module.exports = config;