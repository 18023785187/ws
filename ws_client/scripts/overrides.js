const path = require('path')
const { override } = require('customize-cra')

module.exports = override(
    aliasConfig,
    lessConfig
)
// 路径别名
function aliasConfig(config) {
    config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve('./', 'src'),
        "components": "@/components",
        "assets": "@/assets",
        "api": "@/api",
        "utils": "@/utils",
    }
    return config
}
// less
function lessConfig(config) {
    const lessLoader = {
        test: /\.less$/,
        use: [
            {
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
            }, {
                loader: 'less-loader'
            }
        ]
    }
    const oneOf = config.module.rules.find(rule => rule.oneOf).oneOf
    oneOf.unshift(lessLoader)
    return config
}
