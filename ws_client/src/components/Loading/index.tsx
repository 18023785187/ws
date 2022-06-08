/**
 * 加载中
 */
import { Spin } from 'antd'
import style from './style/index.module.less'

function Loading() {

  return (
    <div className={style['loading']}>
      <Spin size="large" />
    </div>
  )
}

export default Loading
