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
    module: {
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
                        'css-loader', 
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
    // webpack 中有一个很关键的模块 enhanced-resolve 就是处理依赖模块路径的解析的，
    //这个模块可以说是 Node.js 那一套模块路径解析的增强版本，有很多可以自定义的解析配置。

    // 1.模块解析规则
    // 1.1 解析相对路径
        // 1.1.1查找相对当前模块的路径下是否有对应文件或文件夹
        // 1.1.2是文件则直接加载
        // 1.1.3是文件夹则继续查找文件夹下的 package.json 文件
        // 1.1.4有 package.json 文件则按照文件中 main 字段的文件名来查找文件
        // 1.1.5无 package.json 或者无 main 字段则查找 index.js 文件...

    // 1.2 解析模块名
        // 查找当前文件目录下，父级目录及以上目录下的 node_modules 文件夹，看是否有对应名称的模块
    //1.3 解析绝对路径（不建议使用）
        // 直接查找对应路径的文件
    
    // 在 webpack 配置中，和模块路径解析相关的配置都在 resolve 字段下
    resolve: {
        // 假设我们有个 utils 模块极其常用，经常编写相对路径很麻烦，希望可以直接 import 'utils' 来引用，那么我们可以配置某个模块的别名/
        alias: {
            // 配置是模糊匹配，意味着只要模块路径中携带了 utils 就可以被替换掉
            // - import 'utils/query.js' // 等同于 import '[项目绝对路径]/src/utils/query.js'
            utils: path.resolve(__dirname, 'src/utils'), // 这里使用 path.resolve 和 __dirname 来获取绝对路径
            // 精确匹配，只匹配 log
            log$: path.resolve(__dirname, 'src/utils/log.js') 
        },

        // 对于直接声明依赖名的模块（如 react ），webpack 会类似 Node.js 一样进行路径搜索，
        //搜索 node_modules 目录，这个目录就是使用 resolve.modules 字段进行配置的

        // 通常情况下，我们不会调整这个配置，但是如果可以确定项目内所有的第三方依赖模块都是在项目根目录下的
        // node_modules 中的话，那么可以在 node_modules 之前配置一个确定的绝对路径
        modules: [
                path.resolve(__dirname, 'node_modules'), // 指定当前目录下的 node_modules 优先查找
                'mode_modules',
                path.resolve(__dirname, 'src'), // 如果有一些类库是放在一些奇怪的地方的，你可以添加自定义的路径或者目录
            ],

        // 看到数组中配置的字符串大概就可以猜到，这个配置的作用是和文件后缀名有关的。是的，这个配置可以定义在进行模块路径解析时，webpack 会尝试帮
        // 你补全那些后缀名来进行查找，例如有了上述的配置，当你在 src/utils/ 目录下有一个 common.js 文件时，就可以这样来引用：...
        //例如： import * as common from './src/utils/common'。
            //-  webpack 会尝试给你依赖的路径添加上 extensions 字段所配置的后缀，然后进行依赖路径查找。
            // - 这里的顺序代表匹配后缀的优先级，例如对于 index.js 和 index.jsx，会优先选择 index.js
        extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"],

        // 当目录下没有 package.json 文件时，会默认使用目录下的 index.js 这个文件，其实这个也是可以配置的，是的，使用 resolve.mainFiles 字段，
        mainFiles: ['index']

        
        // webpack 配置中指定的 target(web, webworker, node) 不同，在package.json中使用哪个字段作为导入模块可以通过resolve.mainFields 控制。
        // - 当target=web 或target=webworker, 如果package.json中出现下面三个字段，在优先使用 browser > module > main
        // mainFields: ['browser', 'module', 'main']
        //  - 当target=node, 如果package.json中出现下面三个字段，在优先使用  module > main
        // mainFields: ['module', 'main']    
        
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