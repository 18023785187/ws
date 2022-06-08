const path = require('path')
const { override } = require('customize-cra')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = override(
  aliasConfig,
  lessConfig,
  cesiumConfig
)
// 路径别名
function aliasConfig(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": path.resolve('./', 'src'),
    "components": "@/components",
    "pages": "@/pages",
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

// cesium
function cesiumConfig(config) {
  // cseium配置 1.创建路径
  const cesiumSource = './node_modules/cesium/Source'
  const cesiumWorkers = '../Build/Cesium/Workers'
  // loader
  config.module.unknownContextCritical = false
  // plugins
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' }]
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(cesiumSource, 'Assets'), to: 'Assets' }]
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }]
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' }]
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(cesiumSource, 'Core'), to: 'Core' }]
    }),
    // cseium配置 3. 配置CESIUM_BASE_URL路径
    new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify('')
    })
  )
  return config
}
