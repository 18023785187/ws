/**
 * 聊天内容
 */
import { useEffect, useState } from 'react'
import PubSub from 'pubsub-js'
import Text from './Text'
import MessageType from '@/constants/messageType'
import Pubsub from '@/constants/pubsub'
import Ws from 'utils/ws'
import IndexedDB, { Tabel } from '@/utils/indexedDB'

type messageDataType = {
    type: MessageType,
    target: boolean,
    name: string,
    imageUrl: string | null,
    data: any,
    date: string,
}

function Content() {
    const [messageData, setMessageData] = useState<messageDataType[]>([])

    useEffect(() => {
        IndexedDB.async(
            () => {
                IndexedDB.getTargetObjectStoreData(
                    Tabel.MESSAGE,
                    (res: messageDataType[]) => setMessageData(res)
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
                        (res: messageDataType[]) => setMessageData(res)
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
            if (type === MessageType.TEXT) {
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
                                    (res: messageDataType[]) => setMessageData(res)
                                )
                            }
                        )
                    }
                )
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
                    const { type, target, name, imageUrl, data, date } = item
                    const info = { target, name, imageUrl, data }
                    switch (type) {
                        case MessageType.TEXT:
                            return <Text key={date} {...info} />
                        default:
                            return
                    }
                })
            }
        </div>
    )
}

export default Content
