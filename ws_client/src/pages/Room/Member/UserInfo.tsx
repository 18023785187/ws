/**
 * 用户信息
 */
import { memo } from 'react'
import { Avatar } from 'antd'

interface IProps {
  imageUrl: string | null,
  name: string
}

function UserInfo(props: IProps) {
  const { imageUrl, name } = props

  return (
    <div className="user-info">
      <div className="user-info-image">
        {
          imageUrl ?
            <img className='user-image' src={imageUrl} alt="头像" /> :
            <Avatar className='user-image' size="large">{name}</Avatar>
        }
      </div>
      <p className='user-info-name'>{name}</p>
    </div>
  )
}

export default memo(UserInfo)
