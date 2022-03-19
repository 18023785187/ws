import { useState, useEffect, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

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
    const [flag, setFlag] = useState<boolean>(!!window.localStorage.getItem('darkmode'))
    const [darkmode, setDarkmode] = useState<boolean>(false)

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
        navigate('/')
    }

    return (
        <div className="nav-bar">
            <div className="left"></div>
            <div className="center">HTM聊天室</div>
            <div className="right">
                <div className="right-icon" title="设置" onMouseDown={settingOpen}>
                    <div className="right-icon-line-1" style={settingStyle[0]}></div>
                    <div className="right-icon-line-2" style={settingStyle[1]}></div>
                    <div className="right-icon-line-3" style={settingStyle[2]}></div>
                </div>
                <div className='pop-up' style={{ display: flag ? 'none' : '' }} onMouseDown={(e) => e.stopPropagation()}>
                    <div className='pop-up-item' onClick={mode}>{darkmode ? '白天模式' : '黑夜模式'}</div>
                    <div className='pop-up-item' onClick={exit}>退出房间</div>
                </div>
            </div>
        </div>
    )
}

export default NavBar
