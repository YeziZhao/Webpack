const path = require('path');
const UglifyPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: './src/entry.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist/[hash]'),
        filename: '[name].js'
    },
    module: {
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
                // 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    // sourceMap: true, // 可以不开启，开启会增加开销
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
        // DefinePlugin 是 webpack 内置的插件，可以使用 webpack.DefinePlugin 直接获取。
        // 这个插件用于创建一些在编译时可以配置的全局常量，这些常量的值我们可以在 webpack 的配置中去指定，例如下面的配置后，在应用上下文代码中，就可以
        // 访问配置好的变量
        // console.log('Running app version:', VERSION)
        // console.log('Running app production:', PRODUCTION)

        // 配置规则
        // - 字符串： 整个字符串会被当代码片段来执行。 例如 '1+1', 最终结果为2
        // - 不是字符串，不是仔面了： 该值会被转换为字符串。例如true, 结果是 'true'
        // - 对象字面量： 该对象的key值，会按照上面的方式进行转换

        // 因此希望时字符串时，可以使用JSON.stringify进行转换。
        // 该插件用于定义环境变量最多：例如PRODUCT=true, __DEV__=true

        // 建议使用 process.env.NODE_ENV: ... 的方式来定义 process.env.NODE_ENV，而不是使用 process: { env: { NODE_ENV: ... } } 的方式，
        // 因为这样会覆盖掉 process 这个对象，可能会对其他代码造成影响。...
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true), // const PRODUCTION = true
            VERSION: JSON.stringify('5fa3b9'), // const VERSION = '5fa3b9'
            BROWSER_SUPPORTS_HTML5: true, // const BROWSER_SUPPORTS_HTML5 = 'true'
            TWO: '1+1', // const TWO = 1 + 1,
            CONSTANTS: {
              APP_VERSION: JSON.stringify('1.1.2') // const CONSTANTS = { APP_VERSION: '1.1.2' }
            }
        },

        // 我们一般会把开发的所有源码和资源文件放在 src/ 目录下，构建的时候产出一个 build/ 目录，通常会直接拿 build 中的所有文件来发布。
        // 有些文件没经过 webpack 处理，但是我们希望它们也能出现在 build 目录下，这时就可以使用 CopyWebpackPlugin 来处理了...
        new CopyWebpackPlugin([
            {from: 'src/file.text', to: 'build/file.txt'} // from 配置来源，to 配置目标路径
            { from: 'src/*.ico', to: 'build/*.ico' }, // 配置项可以使用 glob
        ]),

        // extract-text-webpack-plugin 把依赖的 CSS 分离出来成为单独的文件
        // new ExtractTextPlugin('index.css'): 使用了 index.css 作为单独分离出来的文件名，但有的时候构建入口不止一个
        // extract-text-webpack-plugin 会为每一个入口创建单独分离的文件，因此最好这样配置,确保在使用多个构建入口时，生成不同名称的文件
        // 注意点： 除了在 plugins 字段添加插件实例之外，还需要调整 loader 对应的配置
        new ExtractTextPlugin('[name].css'),

        // ProviderPlugin是webpack内置插件，该组件用于引用某些模块作为运行时的变量.
        // 这个可以使jquery变成全局变量，不用在自己文件require('jquery')了
        new webpack.ProviderPlugin({
            $: './lib/jquery'
            $: 'jquery' // 先给jquery起个别名，这里可以使用别名。resolve:{alias: {jquery: "./lib/jquery"}}
        })

        // 忽略某些特定的模块，让 webpack 不把这些指定的模块打包进去:
            // - 第一个是匹配引入模块路径的正则表达式，第二个是匹配模块的对应上下文，即所在目录名
            // 下面是：排除moment模块下面的locale的所有文件， 不被打包
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

        new HtmlWebpackPlugin({
            filename: 'index.html', // 配置输出文件名和路径
            template: path.resolve(__dirname, 'src/index.html'), // 配置文件模板
        })
    ]
};