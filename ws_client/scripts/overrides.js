const path = require('path')
const { override } = require('customize-cra')


module.exports = override(
    aliasConfig,

)
// 路径别名
function aliasConfig(config) {
    config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve('./', 'src'),
        "pages": "@/pages",
        "components": "@/components",
        "assets": "@/assets",
        "api": "@/api",
        "utils": "@/utils",
    }
    return config
}

