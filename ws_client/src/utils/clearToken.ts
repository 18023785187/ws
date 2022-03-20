/**
 * 初始化存储器
 */
import { WS_SERVICE_URL, CONNECT_TOKEN, USER_INFO } from '@/constants/sessionStorage'

function clearToken(): void {
    window.sessionStorage.removeItem(USER_INFO)
    window.sessionStorage.removeItem(WS_SERVICE_URL)
    window.sessionStorage.removeItem(CONNECT_TOKEN)
}

export default clearToken
