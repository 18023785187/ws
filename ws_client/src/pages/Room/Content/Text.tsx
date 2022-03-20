/**
 * 普通文本
 */
import { memo } from 'react'
import { Avatar } from 'antd'

interface IProps {
    imageUrl: string | null
    name: string
    data: string
    target: boolean
}

function Text(props: IProps) {
    const { imageUrl, name, data, target } = props

    return (
        <div className={target ? 'text-2' : 'text-1'}>
            {
                imageUrl ?
                    <img className='user-image' src={imageUrl} alt="头像" /> :
                    <Avatar className='user-image' size="large">{name}</Avatar>
            }
            <div className='text-info'>
                {target ? '' : <div className='user-name'>{name}</div>}
                <div className={target ? 'text-content-2' : 'text-content-1'}>{data}</div>
            </div>
        </div>
    )
}

export default memo(Text)
