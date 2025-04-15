module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
          alias: {
            "@": "./src",
            "@assets": "./src/assets",
            "@components": "./src/components",
            "@constants": "./src/constants",
            "@features": "./src/features",
            "@hooks": "./src/hooks",
            "@lib": "./src/lib",
            "@store": "./src/store",
            "@types": "./src/types",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};

