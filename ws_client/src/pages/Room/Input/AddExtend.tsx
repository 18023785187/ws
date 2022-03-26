import { useEffect } from 'react'
import imagePlugin, { imageInput } from './plugins/image-plugin'

function AddExtend() {

    // 发送选中相片时间
    useEffect(() => {
        const destroy = imagePlugin()

        return () => {
            destroy()
        }
    }, [])

    const extendList = [
        {
            name: '相册',
            icon: '&#xe6b2;',
            event: () => imageInput.click()
        },
        {
            name: '视频通话',
            icon: '&#xe7a4;',
            event: () => imageInput.click()
        },
        {
            name: '位置',
            icon: '&#xe676;',
            event: () => imageInput.click()
        }
    ]

    return (
        <div className="add-extend">
            {
                extendList.map((item, index) => (
                    <div className="add-extend-item" key={index}>
                        <div className="add-extend-item-img iconfont" onClick={item.event} dangerouslySetInnerHTML={{ __html: item.icon }}></div>
                        <p className="add-extend-item-title">{item.name}</p>
                    </div>
                ))
            }
        </div>
    )
}

export default AddExtend
