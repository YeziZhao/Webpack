const path = require('path');
const UglifyPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    // webpack 的入口
    entry: './src/entry.js',
    mode: 'production',
    // webpack 的输出。为了避免生成的文件在发布时使用缓存，则可以使用`hash`的方式
    output: {
        path: path.resolve(__dirname, 'dist/[hash]'),
        filename: '[name].js'
    },
    module: {
        rules: [
            // Babel 是一个让我们能够使用 ES 新特性的 JS 编译工具，我们可以在 webpack 中配置 Babel，以便使用 ES6、ES7 标准来编写 JS 代码。
            // Babel 的相关配置可以在目录下使用 .babelrc 文件来处理
            {
                test: /\.js|\.jsx/,// 支持 js 和 jsx
                include: [
                    path.resolve(__dirname, 'src') // // src 目录下的才需要经过 babel-loader 处理
                ],
                use: 'babel-loader'
            },
            {
                test: /\.css|\.less/,
                // css-loader 负责解析 CSS 代码，主要是为了处理 CSS 中的依赖，例如 @import 和 url() 等引用外部文件的声明
                // style-loader 会将 css-loader 解析的结果转变成 JS 代码，运行时动态插入 style 标签来让 CSS 代码生效。
                // 经由上述两个 loader 的处理后，CSS 代码会转变为 JS，和 index.js 一起打包了。如果需要单独把 CSS 文件分离出来，
                //我们需要使用 extract-text-webpack-plugin 插件: 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader

                // 在上述使用 CSS 的基础上，通常我们会使用 Less/Sass 等 CSS 预处理器，webpack 可以通过添加对应的 loader 来支持，以使用 Less 为例
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader', 
                        'less-loader'
                    ]
                })
            },
            // 在前端项目的样式中总会使用到图片，虽然我们已经提到 css-loader 会解析样式中用 url() 引用的文件路径，但是图片对应的 jpg/png/gif 
            // 等文件格式，webpack 处理不了。是的，我们只要添加一个处理图片的 loader 配置就可以了，现有的 file-loader 就是个不错的选择。
            // file-loader 可以用于处理很多类型的文件，它的主要作用是直接输出文件，把构建后的文件路径返回...
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
    // 代码模块路径解析的配置
    resolve: {
        modules: [
            'mode_modules',
            path.resolve(__dirname, 'src')
        ],
        extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"],
    },
    plugins: [
        // 使用 uglifyjs-webpack-plugin 来压缩 JS 代码
        // 直接使用 webpack --mode production: 会发现默认已经使用了 JS 代码压缩的插件.其实也是我们命令中的 --mode production 的效果
        new UglifyPlugin(), 
        // 将css抽取到独立的文件中
        new ExtractTextPlugin('[name].css'),
        // 会为我们创建一个 HTML 文件，其中会引用构建出来的 JS 文件。实际项目中，默认创建的 HTML 文件并没有什么用，我们需要自己来写 HTML 文件，可以通过 html-webpack-plugin 的配置，传递一个写好的 HTML 模板
        new HtmlWebpackPlugin({
            filename: 'index.html', // 配置输出文件名和路径
            template: path.resolve(__dirname, 'src/index.html'), // 配置文件模板
        })
    ],
    // 启动静态服务: webpack-dev-server。 使用命令：webpack-dev-server --mode development
};