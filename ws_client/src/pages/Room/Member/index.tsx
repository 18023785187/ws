/**
 * 群成员一览表
 */
import { useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react'
import Ws, { WsEvent } from 'utils/ws'
import UserInfo from './UserInfo'

interface IProps { 
    count: number
}

interface IMemberRef {
    show: () => void
}

export default memo(forwardRef<IMemberRef, IProps>(
    function Member(props, ref) {
        const [show, setShow] = useState<boolean>(false)
        const [userInfoList, setUserInfoList] = useState<{ imageUrl: string | null, name: string }[]>([])

        useImperativeHandle(ref, () => ({
            show: () => {
                setShow(true)
            }
        }))

        useEffect(() => {
            Ws.ws?.addEventListener('message', handle)

            function handle(e: MessageEvent) {
                const { type, data } = JSON.parse(e.data)
                if (type === WsEvent.SHOW_MEMBER) {
                    setUserInfoList(data.userInfoList)
                }
            }

            return () => {
                Ws.ws?.removeEventListener('message', handle)
            }
        }, [])

        useEffect(() => {
            Ws.ws?.send(JSON.stringify({
                type: WsEvent.SHOW_MEMBER
            }))
        }, [])

        return (
            <div className="member" style={{ transform: show ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)' }}>
                <div className="member-nav">
                    <div className="left iconfont" onClick={() => setShow(false)}>&#xe600;</div>
                    <div className="center">HYM聊天室({props.count})</div>
                    <div className="right"></div>
                </div>
                <div className="member-content">
                    {userInfoList.map(userInfo => <UserInfo key={userInfo.name} {...userInfo} />)}
                </div>
            </div>
        )
    }
))

export type {
    IMemberRef
}
