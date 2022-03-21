/**
 * 导航头
 */
import { useState, useEffect, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import Ws, { WsEvent } from 'utils/ws'
import clearToken from 'utils/clearToken'

const settingStyleTemp = [
    {
        transform: ''
    },
    {
        transform: ''
    },
    {
        transform: ''
    }
]

function NavBar() {
    const navigate = useNavigate()
    // 设置按钮逻辑
    const [settingStyle, setSettingStyle] = useState(settingStyleTemp)
    const [flag, setFlag] = useState<boolean>(true)
    const [darkmode, setDarkmode] = useState<boolean>(JSON.parse(window.localStorage.getItem('darkmode') || 'false'))
    // 人数
    const [count, setCount] = useState<number>(0)

    // 人数监听
    useEffect(() => {
        Ws.ws?.addEventListener('message', countHandle)

        function countHandle(e: MessageEvent) {
            const { type, data } = JSON.parse(e.data)
            if(type === WsEvent.COUNT) {
                setCount(data)
            }
        }
        // 初始化时向服务器询问人数
        Ws.ws?.readyState === 1 && Ws.ws?.send(JSON.stringify({
            type: WsEvent.COUNT
        }))

        return () => {
            Ws.ws?.removeEventListener('message', countHandle)
        }
    }, [])

    useEffect(() => {
        window.addEventListener('mousedown', mousedown)

        function mousedown() {
            setSettingStyle(settingStyleTemp)
            setFlag(true)
        }

        return () => {
            window.removeEventListener('mousedown', mousedown)
        }
    }, [])

    const settingOpen = (e: MouseEvent) => {
        e.stopPropagation()
        setSettingStyle(flag ? [
            {
                transform: 'rotateZ(45deg)'
            },
            {
                transform: 'rotateX(90deg)'
            },
            {
                transform: 'rotateZ(-45deg)'
            }
        ] : settingStyleTemp)
        setFlag(!flag)
    }
    // 设置按钮逻辑end
    const mode = () => {
        (document.getElementsByClassName('darkmode-toggle')[0] as HTMLElement)?.click()
        setDarkmode(!darkmode)
    }
    const exit = (e: MouseEvent) => {
        setFlag(true)
        message.success('退出中...', 2, () => {
            Ws.ws?.close()
            clearToken()
            navigate('/')
        })
    }

    return (
        <div className="nav-bar">
            <div className="left"></div>
            <div className="center">HYM聊天室({count})</div>
            <div className="right">
                <div className="right-icon" title="设置" onMouseDown={settingOpen}>
                    <div className="right-icon-line-1" style={settingStyle[0]}></div>
                    <div className="right-icon-line-2" style={settingStyle[1]}></div>
                    <div className="right-icon-line-3" style={settingStyle[2]}></div>
                </div>
                <div className='pop-up' style={flag ? { transform: 'scale(0, 0)' } : {}} onMouseDown={(e) => e.stopPropagation()}>
                    <div className='pop-up-item' onClick={mode}>{darkmode ? '白天模式' : '黑夜模式'}</div>
                    <div className='pop-up-item' onClick={exit}>退出房间</div>
                </div>
            </div>
        </div>
    )
}

export default NavBar
