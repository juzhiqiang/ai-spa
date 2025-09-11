const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { resolve, join } = require('path');

module.exports = {
    output: {
        path: join(__dirname, '../dist'),
        publicPath: '/',
        //如果是通过loader 编译的 放到scripts文件夹里 filename
        filename: 'scripts/[name].[contenthash:5].bundle.js',
        //如果是通过'asset/resource' 编译的
        assetModuleFilename: 'images/[name].[contenthash:5].[ext]',
    },
    performance: {
        maxAssetSize: 250000, // 最大资源大小250KB
        maxEntrypointSize: 250000, // 最大入口资源大小250KB
        hints: 'warning', // 超出限制时只给出警告
    },
    optimization: {
        minimize: true,
        // css + js启用多线程压缩，需要机器不太老，否则会卡顿
        minimizer: [
            new CssMinimizerPlugin({
                parallel: true,
            }),
            new TerserPlugin({
                parallel: true,
            }),
        ],
    },
    //用公司现有的组件库 公司自建CDN 上线CI机器压缩
    //优化项目的构建速度 一半在服务器上 一半在本地开发模式上
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Yideng',
            filename: 'index.html',
            template: resolve(__dirname, '../src/index-prod.html'),
            favicon: './public/favicon.ico',
        }),
    ],
};
