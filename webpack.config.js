const path = require('path');

let production = process.env['NODE_ENV'] == 'production';
module.exports = {
    mode: production ? "production" : "development",
    devServer: {
        hot: true,
        contentBase: path.resolve(__dirname, "./demo"),
        host: '0.0.0.0',
        // port: 443,
        // https: true,
        publicPath: "/",
        // disableHostCheck: true,
    },
    entry: {
        main: "./src/inspect.js"
    },
    output: {
        filename: "veinspect.js",
        library: 'veinspect',
        libraryTarget: 'umd',
        sourcePrefix: '   '
    },
    devtool: production ? false : 'source-map',
    stats: {
        colors: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                options: {
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                targets: {
                                    browsers: ['ie >= 8']
                                }
                            }
                        ]
                    ]
                }
            }
        ]
    }
}