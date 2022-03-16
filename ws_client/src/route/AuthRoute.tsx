import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CONNECT_TOKEN } from '@/constants/sessionStorage'

interface IProps {
    components: any,
    redirect: string
}

function AuthRoute(props: IProps) {
    const navigate = useNavigate()
  
    useEffect(() => {
      const connect_token = window.sessionStorage.getItem(CONNECT_TOKEN)

      if(!connect_token) {
          console.log(4545)
        navigate(props.redirect)
      }
    })

    return (
        props.components
    )
}

export default AuthRoute
