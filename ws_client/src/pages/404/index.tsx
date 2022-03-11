import React, { FC } from 'react'
import { Result, Button } from 'antd'
import { Link } from "react-router-dom"

const Page404: FC = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉, 您访问的页面不存在"
      extra={<Button type="primary"><Link to="/">回到主页</Link></Button>}
    />
  )
};

export default Page404
