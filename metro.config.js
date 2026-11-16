// Default Expo Metro config. Firebase's "react-native" export condition is
// resolved automatically, giving the React Native build of firebase/auth.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
