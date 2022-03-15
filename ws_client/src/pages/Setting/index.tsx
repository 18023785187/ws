import { useState, useEffect } from 'react'
import { Upload } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
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

    return (
        <div className={style['setting']}>
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
        </div >
    )
}

export default Setting
