const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Design tokens + Tailwind layers live in src/shared/theme/global.css (imported once in src/app/_layout.tsx).
// inlineRem 16: `p-4` = 16px like the web client and Flutter AppSpacing (NativeWind default rem is 14).
module.exports = withNativeWind(config, { input: './src/shared/theme/global.css', inlineRem: 16 });
