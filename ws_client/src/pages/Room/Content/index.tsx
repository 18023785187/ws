/**
 * 聊天内容
 */
import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import PubSub from 'pubsub-js'
import Text from './Text'
import Image from './Image'
import Record from './Record'
import Enter from './Enter'
import MessageType from '@/constants/messageType'
import Pubsub from '@/constants/pubsub'
import Ws from 'utils/ws'
import IndexedDB, { Tabel } from '@/utils/indexedDB'
import { USER_INFO } from '@/constants/sessionStorage'
import type { TextProps, ImageProps, RecordProps, EnterProps } from './typings'
import notification from 'utils/notification'

let timer: number
let contentScrollFlag: boolean = true

function Content() {
    const [messageData, setMessageData] = useState<unknown[]>([])
    const { id } = JSON.parse(window.sessionStorage.getItem(USER_INFO)!)
    // 内容dom
    const ContentRef = useRef<HTMLDivElement>(null)
    // 浏览器是否最小化
    const [isDormancy, setIsDormancy] = useState<boolean>(false)

    // 初始化时从indexedDB获取信息
    useEffect(() => {
        IndexedDB.async(
            () => {
                IndexedDB.getDataToTargetObjectStore(
                    Tabel.MESSAGE,
                    id,
                    (e) => {
                        setMessageData(e.target.result?.data ?? [])
                    }
                )
            }
        )
    }, [id])
    // 发布信息改变事件
    useEffect(() => {
        PubSub.subscribe(Pubsub.CHANGE_MESSAGE, () => {
            IndexedDB.async(
                () => {
                    IndexedDB.getDataToTargetObjectStore(
                        Tabel.MESSAGE,
                        id,
                        (e) => {
                            setMessageData(e.target.result.data)
                        }
                    )
                }
            )
        })

        return () => {
            PubSub.unsubscribe(Pubsub.CHANGE_MESSAGE)
        }
    }, [id])

    useLayoutEffect(() => {
        contentScrollFlag && down()
    }, [messageData])

    // 监听ws信息事件, 在视口最小化时增加消息提醒
    useEffect(() => {
        Ws.ws?.addEventListener('message', handle)

        function handle(e: MessageEvent) {
            const { type, data: datas } = JSON.parse(e.data)
            switch (type) {
                case MessageType.TEXT:
                    isDormancy && notification.message('HYM聊天室', `${datas.name}：${datas.data}`)
                    changeMessage(MessageType.TEXT, { ...datas, target: false })
                    break
                case MessageType.IMAGE:
                    isDormancy && notification.message('HYM聊天室', `${datas.name}：[图片]`)
                    changeMessage(MessageType.IMAGE, { ...datas, target: false })
                    break
                case MessageType.RECORD:
                    isDormancy && notification.message('HYM聊天室', `${datas.name}：[语音]`)
                    changeMessage(MessageType.RECORD, { ...datas, target: false })
                    break
                case MessageType.ENTER:
                    isDormancy && notification.message('HYM聊天室', `${datas.name}进入群聊`)
                    changeMessage(MessageType.ENTER, datas)
                    break
                default:
                    break
            }

            function changeMessage(
                messageType: MessageType,
                datas: { id: string, [propName: string]: any }
            ): void {
                IndexedDB.async(
                    () => {
                        IndexedDB.putDataToTargetObjectStore(
                            Tabel.MESSAGE,
                            id,
                            (prevData, next) => {
                                prevData.push({
                                    ...datas,
                                    type: messageType
                                })
                                next(prevData)
                                setMessageData(prevData)
                            }
                        )
                    }
                )
            }
        }

        return () => {
            Ws.ws?.removeEventListener('message', handle)
        }
    }, [id, isDormancy])

    // 浏览器最小化
    useEffect(() => {
        document.addEventListener('visibilitychange', handle)

        function handle(): void {
            document.visibilityState === 'hidden' ? setIsDormancy(true) : setIsDormancy(false)
        }

        return () => {
            document.removeEventListener('visibilitychange', handle)
        }
    }, [])

    const down = useCallback(() => {
        ContentRef.current!.scrollTop = ContentRef.current!.scrollHeight
    }, [])
    // 用户滑动内容区时停止新信息滚动
    function contentScroll(): void {
        contentScrollFlag = false
        window.clearTimeout(timer)
        timer = window.setTimeout(() => contentScrollFlag = true, 500)
    }

    return (
        <div className='content' ref={ContentRef} onScroll={contentScroll}>
            {
                messageData.map(item => {
                    const { type } = item as { type: MessageType }
                    switch (type) {
                        case MessageType.TEXT: {
                            // const { id, target, name, imageUrl, data, date } = item as TextProps
                            const { id, target, name, imageUrl, data } = item as TextProps
                            const info = { target, name, imageUrl, data }
                            return <Text key={id} {...info} />
                        }
                        case MessageType.IMAGE: {
                            // const { id, target, name, imageUrl, data, date } = item as TextProps
                            const { id, target, name, imageUrl, data } = item as ImageProps
                            const info = { target, name, imageUrl, data }
                            return <Image key={id} {...info} loading={down} />
                        }
                        case MessageType.RECORD: {
                            // const { id, target, name, imageUrl, data, date } = item as TextProps
                            const { id, target, name, imageUrl, data } = item as RecordProps
                            const info = { target, name, imageUrl, data }
                            return <Record key={id} {...info} />
                        }
                        case MessageType.ENTER: {
                            // const { name, date, id } = item as EnterProps
                            const { name, id } = item as EnterProps
                            return <Enter key={id} name={name} />
                        }
                        default:
                            return ''
                    }
                })
            }
        </div>
    )
}

export default Content
