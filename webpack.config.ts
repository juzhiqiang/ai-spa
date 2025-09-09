export default {
    module:{
        rules:[
            // 加入swc
            {
                test:/\.(ts|tsx)$/,
                exclude:/node_modules/,
                use :{
                    loader: 'swc-loader',
                }
            },
        ],
    }
}