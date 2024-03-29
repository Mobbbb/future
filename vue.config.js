'use strict'

const name = 'Future'
const shortName = 'Future'
const outputDir = 'dist'
const assetsDir = 'static'
const proxyConfig = {
    '/api': {
        target: `https:${process.env.VUE_APP_HOST}`,
        changOrigin: true,
        secure: false, // 关闭ssl证书验证
    },
    '/resource': {
        target: `https:${process.env.VUE_APP_HOST}`,
        changOrigin: true,
        secure: false, // 关闭ssl证书验证
    },
}

const path = require('path')
const resourceConfig = require('./src/config/resource.js')
const CopyWebpackPlugin = require('copy-webpack-plugin')

function resolve(dir) {
    return path.join(__dirname, dir)
}

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
    lintOnSave: false,
    /**
     * You will need to set publicPath if you plan to deploy your site under a sub path,
     * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
     * then publicPath should be set to "/bar/".
     * In most cases please use '/' !!!
     * Detail: https://cli.vuejs.org/config/#publicpath
     */
    publicPath: resourceConfig.publicPath || '/',
    outputDir,
    assetsDir,
    // filenameHashing: false, 文件不带hash
    productionSourceMap: false,

    devServer: {
        proxy: proxyConfig,
    },

    configureWebpack: (config) => {
        // config.output.filename = 'static/js/[name].[hash].js' // 入口文件chunk的命名
        // config.output.chunkFilename = 'static/js/[name].[hash].js' // 除入口文件外的chunk的命名
        if (process.env.NODE_ENV === 'production') { // 打包时使用cdn
            config.externals = {
                vue: 'Vue',
                'element-plus': 'ElementPlus',
            }
        }

        config.plugins.push(
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, './sw.js'),
                        to: path.resolve(__dirname, './dist'),
                        globOptions: {
                            ignore: ['.*'],
                        },
                    },
                    {
                        from: path.resolve(__dirname, './manifest.json'),
                        to: path.resolve(__dirname, './dist'),
                        globOptions: {
                            ignore: ['.*'],
                        },
                    },
                ],
            }),
        )

        return {
            resolve: {
                alias: {
                    '@': resolve('src'),
                    package: resolve('package.json'),
                },
            },
        }
    },
    chainWebpack: (config) => {
        config.plugin('html').tap(args => {
            args[0].title = name
            args[0].shortName = shortName
            if (process.env.NODE_ENV === 'production') {
                // 生产环境下注入在html模板注入cdn
                args[0].resourceConfig = resourceConfig
            }
            return args
        })
    },
}
