import { useState, useEffect } from 'react'
import { Upload, Input, Tooltip, Button } from 'antd'
import { PlusOutlined, InfoCircleOutlined, UserOutlined } from '@ant-design/icons'
import Ws from 'utils/ws'
import { WS_SERVICE_URL, CONNECT_TOKEN } from '@/constants/sessionStorage'
import style from './style/index.module.less'

function Setting() {

    useEffect(() => {
        const url = window.sessionStorage.getItem(WS_SERVICE_URL)!
        Ws.createWebSocket(
            url,
            (e) => {

            },
            (e) => {
                window.sessionStorage.setItem(CONNECT_TOKEN, 'false')
            },
            () => {
                window.sessionStorage.setItem(CONNECT_TOKEN, 'false')
            }
        )
    }, [])

    const [imageUrl, setImageUrl] = useState<string | null>(null)

    const handleChange = (info: any) => {
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, imageUrl => setImageUrl(imageUrl))
        }
    }

    function getBase64(img: Blob, callback: (result: string | null) => void): void {
        const reader = new FileReader()
        reader.addEventListener('load', () => callback(reader.result as string | null))
        reader.readAsDataURL(img)
    }

    const exit = () => {
        window.sessionStorage.removeItem(WS_SERVICE_URL)
        window.sessionStorage.setItem(CONNECT_TOKEN, 'false')
    }

    return (
        <div className={style['setting']}>
            <div className='setting-content'>
                <p className='setting-title'>请设置你的头像与姓名</p>
                <Upload
                    className="avatar-uploader"
                    showUploadList={false}
                    // action="//jsonplaceholder.typicode.com/posts/"
                    onChange={handleChange}
                >
                    {
                        imageUrl ?
                            <img src={imageUrl} alt="" className="avatar" /> :
                            <PlusOutlined className="avatar-uploader-trigger" />
                    }
                </Upload>
                <Input
                    size="large"
                    placeholder="请输入你的姓名"
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    suffix={
                        <Tooltip title="Extra information">
                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                        </Tooltip>
                    }
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
                    >进入连接</Button>
                </div>
            </div>
        </div >
    )
}

export default Setting
