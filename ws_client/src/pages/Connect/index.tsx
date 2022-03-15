/**
 * 链接页
 */
import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Select, Button, message } from 'antd'
import Ws from 'utils/ws'
import Controller from 'utils/cesium'
import waveImg from 'assets/img/wave.gif'
import style from './style/index.module.less'

const Option = Select.Option

message.config({
    maxCount: 1
})

function Connect() {
    const [protocol, setProtocol] = useState<string>('ws://')
    const [inputValue, setInputValue] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const navigate = useNavigate()
    // viewer元素
    const viewerRef = useRef<HTMLDivElement>(null)

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

        controller.addHtmlElementToMap(
            [0, 0],
            {
                tag: 'div',
                innerHTML: 'HYM即时聊天室',
                style: `
                    position: absolute;
                    width: 50vw;
                    font-size: 6vw;
                    font-weight: 700;
                    text-align: center;
                    color: transparent;
                    -webkit-background-clip: text;
                    background-clip: text;
                    background-image: url('${waveImg}');
                    background-size: 80vw 80vw;
                    background-position: 0 -28vw;
                `
            }
        )

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
                message.success('连接成功', 2, () => navigate('/setting'))
            },
            (e) => {
                setLoading(false)
                message.error('连接失败，请重新连接')
            },
            () => {
                setLoading(false)
                message.error('连接超时，请重新连接')
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
            <Select defaultValue="ws://" style={{ width: 80 }} onChange={(val) => { setProtocol(val) }}>
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