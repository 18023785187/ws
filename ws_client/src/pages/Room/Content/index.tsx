/**
 * 聊天内容
 */
import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import PubSub from 'pubsub-js'
import Text from './Text'
import Image from './Image'
import Enter from './Enter'
import MessageType from '@/constants/messageType'
import Pubsub from '@/constants/pubsub'
import Ws from 'utils/ws'
import IndexedDB, { Tabel } from '@/utils/indexedDB'
import { USER_INFO } from '@/constants/sessionStorage'
import type { TextProps, ImageProps, EnterProps } from './typings'

let timer: number
let contentScrollFlag: boolean = true

function Content() {
    const [messageData, setMessageData] = useState<unknown[]>([])
    const { id } = JSON.parse(window.sessionStorage.getItem(USER_INFO)!)
    // 内容dom
    const ContentRef = useRef<HTMLDivElement>(null)

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

    // 监听ws信息事件
    useEffect(() => {
        Ws.ws?.addEventListener('message', handle)

        function handle(e: MessageEvent) {
            const { type, data: datas } = JSON.parse(e.data)
            switch (type) {
                case MessageType.TEXT:
                    changeMessage(MessageType.TEXT, { ...datas, target: false })
                    break
                case MessageType.IMAGE:
                    changeMessage(MessageType.IMAGE, { ...datas, target: false })
                    break
                case MessageType.ENTER:
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
                                console.log(prevData)
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
    }, [id])

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
