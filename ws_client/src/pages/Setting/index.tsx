import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Tooltip, Button, Avatar, message } from 'antd'
import { PlusOutlined, InfoCircleOutlined, UserOutlined, CloseCircleOutlined } from '@ant-design/icons'
import Ws, { WsEvent } from 'utils/ws'
import { WS_SERVICE_URL, CONNECT_TOKEN, USER_INFO } from '@/constants/sessionStorage'
import style from './style/index.module.less'

function Setting() {
    const navigate = useNavigate()

    const [name, setName] = useState<string>('')
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    useEffect(() => {
        Ws.ws?.addEventListener('message', wsMessageEvent)

        function wsMessageEvent(e: MessageEvent) {
            const { type, data } = JSON.parse(e.data)
            if (type === WsEvent.CONNECT) {
                if (data) {
                    message.success('正在进入房间中...', 2, () => {
                        const userInfo = {
                            name,
                            imageUrl
                        }
                        window.sessionStorage.setItem(USER_INFO, JSON.stringify(userInfo))
                        navigate('/room')
                    })
                } else {
                    message.error('当前名字已被注册，请重新选择')
                }
            }
        }

        return () => {
            Ws.ws?.removeEventListener('message', wsMessageEvent)
        }
    }, [name, imageUrl, navigate])

    // 换头像事件
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const reads = new FileReader()
        reads.readAsDataURL(e.target.files![0])
        reads.onload = function (e) {
            setImageUrl(this.result as string)
        }
    }
    // 退出连接
    const exit = () => {
        window.sessionStorage.removeItem(WS_SERVICE_URL)
        window.sessionStorage.setItem(CONNECT_TOKEN, 'false')
        navigate('/')
    }
    // 进入连接
    const emit = () => {
        if (!name) {
            message.error('请输入姓名')
            return
        }
        Ws.connectSend({
            name,
            imageUrl
        })
    }

    return (
        <div className={style['setting']}>
            <div className='setting-content'>
                <p className='setting-title'>请设置你的头像与姓名</p>
                {/* 头像 */}
                <div className="avatar-uploader">
                    <div className='avatar-uploader-box'>
                        <div className='avatar-file'>
                            <input
                                className='avatar-file-input'
                                type="file"
                                accept="image/*"
                                onChange={handleChange}
                            >
                            </input>
                        </div>
                        {
                            imageUrl ?
                                <img src={imageUrl} alt="头像" className="avatar" /> :
                                name ?
                                    <Avatar className='avatar-uploader-trigger avatar-uploader-trigger-2' size="large">{name}</Avatar> :
                                    <PlusOutlined className="avatar-uploader-trigger avatar-uploader-trigger-1" />
                        }
                    </div>
                    <CloseCircleOutlined
                        className='avatar-close'
                        title='取消头像选择'
                        style={{
                            display: imageUrl ? '' : 'none'
                        }}
                        onClick={() => setImageUrl(null)}
                    />
                </div>
                {/* 输入姓名 */}
                <Input
                    size="large"
                    placeholder="请输入你的姓名"
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    suffix={
                        <Tooltip title="Extra information">
                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                        </Tooltip>
                    }
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                />
                <div className='setting-button'>
                    <Button
                        size="large"
                        type="primary"
                        danger
                        style={{
                            flex: 1,
                            marginRight: 5
                        }}
                        onClick={exit}
                    >退出连接</Button>
                    <Button
                        size="large"
                        type="primary"
                        style={{
                            flex: 1,
                            marginLeft: 5
                        }}
                        onClick={emit}
                    >进入连接</Button>
                </div>
            </div>
        </div >
    )
}

export default Setting
