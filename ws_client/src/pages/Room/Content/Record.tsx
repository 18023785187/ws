/**
 * 语音
 */
import { memo } from 'react'
import { Avatar } from 'antd'

interface IProps {
    target: boolean,
    name: string,
    imageUrl: string | null,
    data: string,
}

function Record(props: IProps) {
    const { imageUrl, name, data, target } = props

    return (
        <div className={target ? 'record-message-2' : 'record-message-1'}>
            {
                imageUrl ?
                    <img className='user-image' src={imageUrl} alt="头像" /> :
                    <Avatar className='user-image' size="large">{name}</Avatar>
            }
            <div className='record-message-info'>
                {target ? '' : <div className='user-name'>{name}</div>}
                <div className={target ? 'record-message-content-2' : 'record-message-content-1'}>
                    <audio style={{ width: '100%' }} src={data} controls></audio>
                </div>
            </div>
        </div>
    )
}

export default memo(Record)