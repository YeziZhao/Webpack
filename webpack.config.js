const path = require('path');
const UglifyPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    entry: './src/entry.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist/[hash]'),
        filename: '[name].js'
    },
    // 当我们需要配置 loader 时，都是在 module.rules 中添加新的配置项，在该字段中，每一项被视为一条匹配使用 loader 的规则。
    // - loader 的匹配规则中有两个最关键的因素：一个是匹配条件，一个是匹配规则后的应用
    // - 每个规则有以下特性 
        // - { test: ... } 匹配特定条件
        // - { include: ... } 匹配特定路径
        // - { exclude: ... } 排除特定路径
        // - { and: [...] }必须匹配数组中所有条件
        // - { or: [...] } 匹配数组中任意一个条件
        // - { not: [...] } 排除匹配数组中所有条件...

    module: {
        // module.noParse 字段，可以用于配置哪些模块文件的内容不需要进行解析。
        // 对于一些不需要解析依赖（即无依赖） 的第三方大型类库等，可以通过这个字段来配置，以提高整体的构建速度。
        // 使用 noParse 进行忽略的模块文件中不能使用 import、require、define 等导入机制。
        noParse: /jquery|lodash/,
        rules: [
            {
                test: /\.js|\.jsx/,// 支持 js 和 jsx
                include: [
                    path.resolve(__dirname, 'src') // // src 目录下的才需要经过 babel-loader 处理
                ],
                use: 'babel-loader'
            },
            {
                test: /\.css|\.less/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                            {
                                // https://webpack.docschina.org/loaders/css-loader/#modules
                                loader: 'css-loader',
                                options: {
                                    // sourceMap: true, // 可以不开启，开启会增加开销
                                    // 用于配置「css-loader 作用于 @import 的资源之前」有多少个 loader： // 0 => 无 loader(默认); 1 => postcss-loader; 2 => postcss-loader, sass-loader
                                    // importLoaders: 1, 
                                    localIdentName: '[name].[local]',  // [name]__[local]--[hash:base64:5] -> name: module name, local: original name
                                    modules: true //  启用 CSS 模块规范，默认情况下，这将启用局部作用域 CSS。（你可以使用 :global(...) 或 :global 关闭选择器 and/or 规则。
                                }
                            },
                        'less-loader'
                    ]
                })
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {}
                    }
                ]
            }
        ]
    },
    resolve: {
        modules: [
                path.resolve(__dirname, 'node_modules'), 
                'mode_modules',
            ],
        extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"],
        mainFiles: ['index']
    },
    plugins: [
        new UglifyPlugin(), 
        new ExtractTextPlugin('[name].css'),
        new HtmlWebpackPlugin({
            filename: 'index.html', // 配置输出文件名和路径
            template: path.resolve(__dirname, 'src/index.html'), // 配置文件模板
        })
    ],
};