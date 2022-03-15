import * as Cesium from 'cesium'

class Controller {
    public el: HTMLDivElement
    public viewer: Cesium.Viewer
    private listNode: HTMLElement[]
    private _options = {
        animation: false,  //动画控制不显示     
        timeline: false,    //时间线不显示
        infoBox: false, // 是否开启地理信息小部件
        geocoder: false, // 是否开启搜索小部件
        homeButton: false, // 是否开启回家小部件
        sceneModePicker: false, // 是否开启地图模式选择小部件 2D 2.5D 3D
        baseLayerPicker: false, // 是否显示地图选择小部件
        navigationHelpButton: false, // 是否开启帮助小部件
        fullscreenButton: false, // 全屏
        // 设置渲染
        orderIndependentTranslucency: false,
        contextOptions: {
            webgl: {
                alpha: true,
            }
        }
    }
    constructor(el: HTMLDivElement, isIndividuation?: boolean) {
        const viewer = new Cesium.Viewer(el, isIndividuation ? this._options : undefined)
        this.el = el
        this.viewer = viewer
        this.listNode = []
            // 隐藏logo
            ; (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none"
    }
    /**
     * 清除默认样式
     */
    public clearDefaultStyle(): void {
        const { viewer } = this
        viewer.scene.skyBox.show = false // 隐藏天空盒
        viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0) // 设置背景透明
        viewer.scene.skyAtmosphere.show = false // 隐藏大气圈
        viewer.scene.sun.show = false // 隐藏太阳
        viewer.scene.moon.show = false // 隐藏月亮
    }
    /**
     * 添加html元素到地图中
     * @param points 经纬度坐标数组
     * @param options 配置对象，tag为标签名；innerHTML为html内容；style为样式字符串；event为绑定事件对象，键为事件名称，值为事件方法数组
     */
    public addHtmlElementToMap(
        points: [number, number],
        options: {
            tag: string,
            innerHTML: string,
            style: string,
            event?: {
                [propName: string]: ((e: Event) => {})[]
            }
        }
    ): void {
        const dom = document.createElement(options.tag)
        dom.innerHTML = options.innerHTML
        dom.style.cssText = options.style
        if (options.event) {
            for (const key in options.event) {
                options.event[key].forEach(fn => dom.addEventListener(key, fn))
            }
        }
        this.el.getElementsByClassName('cesium-viewer')[0].appendChild(dom)

        // 放置html，其原理是给dom元素设置定位，监听preRender事件在每一帧都获取到经纬度坐标并将其转换为视口坐标点赋值给dom
        this.viewer.scene.preRender.addEventListener(() => {
            // 获取经纬度
            const position: Cesium.Cartesian3 = Cesium.Cartesian3.fromDegrees(...points)
            // 将经纬度转化为坐标点
            const canvasPosition: Cesium.Cartesian2 = this.viewer.scene.cartesianToCanvasCoordinates(
                position,
                new Cesium.Cartesian2()
            )
            // defined作用是检测目标是否存在
            if (Cesium.defined(canvasPosition)) {
                dom.style.top = canvasPosition.y + 'px'
                dom.style.left = canvasPosition.x + 'px'
            }
        })
    }
    /**
     * 销毁
     */
    public destroy(): void {
        this.viewer.destroy()
        this.listNode.forEach(node => node.remove())
    }
}

export default Controller
