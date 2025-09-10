const { resolve } = require('path');

const webpackBaseConfig = {
    entry: {
        main: resolve('src/index.tsx'),
    },
    module: {
        rules: [
            // 加入swc
            {
                test: /\.(ts|tsx)$/,
                exclude: /(node_modules)/,
                use: {
                    // `.swcrc` can be used to configure swc
                    loader: 'swc-loader',
                },
            },
        ],
    },
    resolve: {
        alias: {
            '@': resolve('src/'),
            '@components': resolve('src/components'),
            '@hooks': resolve('src/hooks'),
            '@pages': resolve('src/pages'),
            '@layouts': resolve('src/layouts'),
            '@routes': resolve('src/routes'),
            '@assets': resolve('src/assets'),
            '@states': resolve('src/states'),
            '@service': resolve('src/service'),
            '@utils': resolve('src/utils'),
            '@lib': resolve('src/lib'),
            '@constants': resolve('src/constants'),
            '@connections': resolve('src/connections'),
            '@abis': resolve('src/abis'),
            '@types': resolve('src/types'),
        },
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.css'],
        fallback: {
            // stream: require.resolve('stream-browserify'),
        },
    },
};

module.exports = webpackBaseConfig;
