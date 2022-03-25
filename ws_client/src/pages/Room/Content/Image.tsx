/**
 * 图片
 */
import { memo } from 'react'
import { Avatar } from 'antd'

interface IProps {
    target: boolean,
    name: string,
    imageUrl: string | null,
    data: string,
    loading: () => void
}

function Image(props: IProps) {
    const { imageUrl, name, data, target, loading } = props

    return (
        <div className={target ? 'image-2' : 'image-1'}>
            {
                imageUrl ?
                    <img className='user-image' src={imageUrl} alt="头像" /> :
                    <Avatar className='user-image' size="large">{name}</Avatar>
            }
            <div className='image-info'>
                {target ? '' : <div className='user-name'>{name}</div>}
                <img className={target ? 'image-content-2' : 'image-content-1'} src={data} onLoad={loading} />
            </div>
        </div>
    )
}

export default memo(Image)
