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
import type { TextProps, EnterProps } from './typings'

function Content() {
    const [messageData, setMessageData] = useState<unknown[]>([])

    useEffect(() => {
        IndexedDB.async(
            () => {
                IndexedDB.getTargetObjectStoreData(
                    Tabel.MESSAGE,
                    (res: unknown[]) => {
                        setMessageData(res)
                    }
                )
            }
        )
    }, [])

    useEffect(() => {
        PubSub.subscribe(Pubsub.CHANGE_MESSAGE, () => {
            IndexedDB.async(
                () => {
                    IndexedDB.getTargetObjectStoreData(
                        Tabel.MESSAGE,
                        (res: unknown[]) => {
                            setMessageData(res)
                        }
                    )
                }
            )
        })

        return () => {
            PubSub.unsubscribe(Pubsub.CHANGE_MESSAGE)
        }
    }, [])

    useEffect(() => {
        Ws.ws?.addEventListener('message', handle)

        function handle(e: MessageEvent) {
            const { type, data: datas } = JSON.parse(e.data)
            switch (type) {
                case MessageType.TEXT:
                    IndexedDB.async(
                        () => {
                            const { data, name, imageUrl, date } = JSON.parse(datas)
                            IndexedDB.addDataToTargetObjectStore(
                                Tabel.MESSAGE,
                                {
                                    data,
                                    name,
                                    imageUrl,
                                    date,
                                    target: false,
                                    type: MessageType.TEXT
                                },
                                () => {
                                    IndexedDB.getTargetObjectStoreData(
                                        Tabel.MESSAGE,
                                        (res: unknown[]) => setMessageData(res)
                                    )
                                }
                            )
                        }
                    )
                    break;
                case MessageType.ENTER:
                    IndexedDB.async(
                        () => {
                            const { name, date } = JSON.parse(datas)
                            IndexedDB.addDataToTargetObjectStore(
                                Tabel.MESSAGE,
                                {
                                    name,
                                    date,
                                    type: MessageType.ENTER
                                },
                                () => {
                                    IndexedDB.getTargetObjectStoreData(
                                        Tabel.MESSAGE,
                                        (res: unknown[]) => setMessageData(res)
                                    )
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
    }, [])

    return (
        <div className='content'>
            {
                messageData.map(item => {
                    const { type } = item as { type: MessageType }
                    switch (type) {
                        case MessageType.TEXT: {
                            const { target, name, imageUrl, data, date } = item as TextProps
                            const info = { target, name, imageUrl, data }
                            return <Text key={date} {...info} />
                        }
                        case MessageType.ENTER: {
                            const { name, date } = item as EnterProps
                            return <Enter key={date} name={name} />
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
