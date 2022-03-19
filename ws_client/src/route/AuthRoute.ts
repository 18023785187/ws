import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { CONNECT_TOKEN } from '@/constants/sessionStorage'

// 重定向配置器
const redirect = {
  current: '/'
}

/**
 * 路由鉴权
 */
function AuthRoute({ element }: { element: JSX.Element }) {
  const navigate = useNavigate()
  const connect_token = JSON.parse(window.sessionStorage.getItem(CONNECT_TOKEN) ?? 'false')

  useEffect(() => {
    if (!connect_token) {
      navigate(redirect.current)
    }
  }, [connect_token])
  return connect_token ? element : null
}

export default AuthRoute
export {
  redirect
}
