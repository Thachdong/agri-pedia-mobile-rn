// NativeWind v4: className support via the css-interop JSX runtime (its babel plugin also adds the worklets plugin).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
