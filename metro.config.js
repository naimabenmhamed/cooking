const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

// Configuration de base
const defaultConfig = getDefaultConfig(__dirname);

// Configuration personnalisée
const customConfig = {
  resolver: {
    extraNodeModules: {
      // Redirige les imports du module problématique
      'react-native-audio-recorder-player': path.resolve(
        __dirname,
        'node_modules/react-native-audio-recorder-player',
      ),
    },
    // Forcer Metro à chercher les fichiers .js en priorité
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx'],
  },
};

module.exports = mergeConfig(defaultConfig, customConfig);