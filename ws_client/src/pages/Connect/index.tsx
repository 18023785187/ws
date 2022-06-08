/**
 * 链接页
 */
import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Select, Button, message } from 'antd'
import Ws from 'utils/ws'
import Controller from 'utils/cesium'
import clearToken from 'utils/clearToken'
import { GeoJsonDataSource, Entity, Color, Cartesian3 } from 'cesium'
import { geoJson } from '@/constants/geoJson'
import { positions } from '@/constants/positions'
import { WS_SERVICE_URL, CONNECT_TOKEN } from '@/constants/sessionStorage'
import waveImg from 'assets/img/wave.gif'
import style from './style/index.module.less'

const Option = Select.Option

function Connect() {
  const [protocol, setProtocol] = useState<string>('ws://')
  const [inputValue, setInputValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  // viewer元素
  const viewerRef = useRef<HTMLDivElement>(null)

  // 每次进入该页面都会断开之前的连接
  useEffect(() => {
    Ws.ws?.close()
    clearToken()
  }, [])

  // 初始化cesium
  useEffect(() => {
    const controller = new Controller(viewerRef.current as HTMLDivElement, true)
    const { scene } = controller.viewer
    controller.clearDefaultStyle()

    // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
    scene.screenSpaceCameraController.enableTranslate = false;
    // 如果为真，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
    scene.screenSpaceCameraController.enableZoom = false;
    // 如果为真，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。
    scene.screenSpaceCameraController.enableTilt = false;

    // 标题
    controller.addHtmlElementToMap(
      [...positions.ZHONG_GUO],
      {
        tag: 'div',
        innerHTML: 'HYM即时聊天室',
        style: `
                    position: absolute;
                    transform: translate3d(-50%, -100%, 0);
                    width: 50vw;
                    font-size: 6vw;
                    font-weight: 700;
                    text-align: center;
                    color: transparent;
                    -webkit-text-stroke: 1px #aaa;
                    -webkit-background-clip: text;
                    background-clip: text;
                    background-image: url('${waveImg}');
                    background-size: 80vw 80vw;
                    background-position: 0 -28vw;
                    cursor: pointer;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                `,
        event: {
          click: [() => {
            (document.getElementsByClassName('darkmode-toggle')[0] as HTMLElement)?.click()
          }]
        }
      }
    )
      ; (controller.el.getElementsByClassName('cesium-viewer')[0] as HTMLElement).style.overflow = 'visible'

    // 加载geojson数据源
    const promise: Promise<GeoJsonDataSource> = GeoJsonDataSource.load(geoJson.ZHONG_GUO)
    promise
      .then((dataSource: GeoJsonDataSource) => {
        controller.viewer.dataSources.add(dataSource)
        // Entity实体，这条代码会拿到Entity实体，当前实体信息是每个省和直辖市的各种信息
        const entities: Entity[] = dataSource.entities.values;
        for (let i = 0; i < entities.length; ++i) {
          // 获取实体
          const entity: Entity = entities[i];
          // 获取实体的name
          const name: string | undefined = entity.name;
          // 如果有name，那么给这个Entity加一个随机颜色
          if (name) {
            // 将轮廓颜色设置为我们定义的颜色
            (entity.polygon as any).material = Color.fromRandom({
              // 使用要使用的alpha分量代替随机值
              alpha: 1.0,
            });
            // 删除实体的轮廓线
            (entity.polygon as any).outline = false;
            // 根据adcode调整地图板块高度
            (entity.polygon as any).extrudedHeight = entity.properties!.adcode
          }
        }

        // 视图聚焦到中国
        controller.viewer.scene.camera.flyTo({
          destination: Cartesian3.fromDegrees(...positions.ZHONG_GUO, 11000000)
        })
      })

    return () => {
      controller.destroy()
    }
  }, [])

  // 链接
  const connect = () => {
    if (!inputValue) {
      message.error('服务器地址不能为空！')
      return
    }
    setLoading(true)
    const url = protocol + inputValue
    Ws.createWebSocket(
      url,
      (e) => {
        setLoading(false)
        message.success('连接成功', 2, () => {
          window.sessionStorage.setItem(WS_SERVICE_URL, url)
          window.sessionStorage.setItem(CONNECT_TOKEN, 'true')
          navigate('/setting')
        })
      },
      (e) => {
        setLoading(false)
        message.error('连接失败，请重新连接')
        window.sessionStorage.setItem(CONNECT_TOKEN, 'false')
      },
      () => {
        setLoading(false)
        message.error('连接超时，请重新连接')
        window.sessionStorage.setItem(CONNECT_TOKEN, 'false')
      }
    )
  }
  // input双向绑定
  const inputChange = (e: any) => {
    setInputValue(e!.target!.value)
  }

  // 选择协议组件
  const SelectBefore = useMemo(
    () => (
      <Select defaultValue="ws://" style={{ width: '25vw' }} onChange={(val) => { setProtocol(val) }}>
        <Option value="ws://">ws://</Option>
        <Option value="wss://">wss://</Option>
      </Select>
    )
    , []
  )

  return (
    <div className={`${style['connect']} clearfix`}>
      <div className='connect-content'>
        <div className='connect-title' ref={viewerRef}></div>
        <Input
          size='large'
          placeholder="请输入服务器地址"
          addonBefore={SelectBefore}
          value={inputValue}
          onChange={inputChange}
          onPressEnter={connect}
        />
        <Button
          style={useMemo(() => ({ width: '100%' }), [])}
          size='large'
          type="primary"
          loading={loading}
          onClick={connect}
        >
          连接
        </Button>
      </div>
    </div>
  );
}

export default Connect