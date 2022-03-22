/**
 * 聊天内容
 */
import { useEffect, useState } from 'react'
import PubSub from 'pubsub-js'
import Text from './Text'
import Enter from './Enter'
import MessageType from '@/constants/messageType'
import Pubsub from '@/constants/pubsub'
import Ws from 'utils/ws'
import IndexedDB, { Tabel } from '@/utils/indexedDB'
import { USER_INFO } from '@/constants/sessionStorage'
import type { TextProps, EnterProps } from './typings'

function Content() {
    const [messageData, setMessageData] = useState<unknown[]>([])
    const { id } = JSON.parse(window.sessionStorage.getItem(USER_INFO)!)

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

    useEffect(() => {
        Ws.ws?.addEventListener('message', handle)

        function handle(e: MessageEvent) {
            const { type, data: datas } = JSON.parse(e.data)
            switch (type) {
                case MessageType.TEXT:
                    IndexedDB.async(
                        () => {
                            const { data, name, imageUrl, date, id: textId } = datas
                            IndexedDB.putDataToTargetObjectStore(
                                Tabel.MESSAGE,
                                id,
                                (prevData, next) => {
                                    prevData.push({
                                        id: textId,
                                        data,
                                        name,
                                        imageUrl,
                                        date,
                                        target: false,
                                        type: MessageType.TEXT
                                    })
                                    next(prevData)
                                    setMessageData(prevData)
                                }
                            )
                        }
                    )
                    break;
                case MessageType.ENTER:
                    IndexedDB.async(
                        () => {
                            const { name, date, id: enterId } = datas
                            IndexedDB.putDataToTargetObjectStore(
                                Tabel.MESSAGE,
                                id,
                                (prevData, next) => {
                                    prevData.push({
                                        id: enterId,
                                        name,
                                        date,
                                        type: MessageType.ENTER
                                    })
                                    next(prevData)
                                    setMessageData(prevData)
                                }
                            )
                        }
                    )
                    break
                default:
                    break;
            }
        }

        return () => {
            Ws.ws?.removeEventListener('message', handle)
        }
    }, [id])

    return (
        <div className='content'>
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
