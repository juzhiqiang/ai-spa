const { resolve } = require('path');

const webpackBaseConfig = {
  entry: {
    main: resolve("src/index.tsx"),
  },
  module: {
    rules: [
      // 加入swc
      {
        test: /\.(ts|tsx)$/,
        exclude: /(node_modules)/,
        use: {
          // `.swcrc` can be used to configure swc
          loader: "swc-loader",
        },
      },
    ],
  },
};

module.exports = webpackBaseConfig;