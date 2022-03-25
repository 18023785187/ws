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

    const imgClick = () => {
        imageInput.click()
    }

    return (
        <div className="add-extend">
            {
                new Array(50).fill(0).map((_, i) => (
                    <div className="add-extend-item" key={i}>
                        <div className="add-extend-item-img" onClick={imgClick}>

                        </div>
                        <p className="add-extend-item-title">相册</p>
                    </div>
                ))
            }
        </div>
    )
}

export default AddExtend
