/**
 * 图片
 */
import { memo, useLayoutEffect, useRef } from 'react'
import { Avatar } from 'antd'
import zoomerang from 'utils/zoomerang'

interface IProps {
  target: boolean,
  name: string,
  imageUrl: string | null,
  data: string,
  loading: () => void
}

function Image(props: IProps) {
  const { imageUrl, name, data, target, loading } = props
  const imageRef = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    zoomerang.listen(imageRef.current)
  }, [])

  return (
    <div className={target ? 'image-2' : 'image-1'}>
      {
        imageUrl ?
          <img className='user-image' src={imageUrl} alt="头像" /> :
          <Avatar className='user-image' size="large">{name}</Avatar>
      }
      <div className='image-info'>
        {target ? '' : <div className='user-name'>{name}</div>}
        <div className={target ? 'image-content-2' : 'image-content-1'}>
          <img
            src={data}
            onLoad={loading}
            ref={imageRef}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(Image)
