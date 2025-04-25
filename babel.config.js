module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@assets': './src/assets',
            '@components': './src/components',
            '@constants': './src/constants',
            '@entities': './src/entities',
            '@features': './src/features',
            '@pagination': './src/pagination',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@lib': './src/lib',
            '@store': './src/store'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  }
}
