/**
 * Cesium配置文件
 */
import '../node_modules/cesium/Source/Widgets/widgets.css'
window.CESIUM_BASE_URL = process!.env!.NODE_ENV === 'development' ? __dirname : __dirname + ''

export {}
 