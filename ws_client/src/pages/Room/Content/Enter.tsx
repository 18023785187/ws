/**
 * 由用户进入房间提示框
 */
import { memo } from 'react'

interface IProps {
    name: string
}

function Enter(props: IProps) {
    const { name } = props

    return (
        <div className='enter'>
            {name} 进入群聊
        </div>
    )
}

export default memo(Enter)
