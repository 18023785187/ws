import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { USER_INFO } from '@/constants/sessionStorage'
import NavBar from './NavBar'
import style from './style/index.module.less'

function Room() {
    const navigate = useNavigate()

    // 只允许设置了用户信息的人进入该页面
    useEffect(() => {
        const user_info = window.sessionStorage.getItem(USER_INFO)
        if(!user_info) {
            navigate('/setting')
        }
    }, [navigate])

    return (
        <div className={style['room']}>
            <NavBar />
        </div>
    )
}

export default Room
