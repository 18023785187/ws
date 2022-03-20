/**
 * 聊天内容
 */
import { useEffect, useState } from 'react'
import PubSub from 'pubsub-js'
import Text from './Text'
import MessageType from '@/constants/messageType'
import Pubsub from '@/constants/pubsub'
import { MESSAGE_DATA } from '@/constants/sessionStorage'
import Ws from 'utils/ws'

type messageDataType = {
    type: MessageType,
    target: boolean,
    name: string,
    imageUrl: string | null,
    data: any,
    date: string,
}

function Content() {
    const [messageData, setMessageData] = useState<messageDataType[]>(JSON.parse(window.sessionStorage.getItem(MESSAGE_DATA)!))

    useEffect(() => {
        PubSub.subscribe(Pubsub.CHANGE_MESSAGE, (_, messageData: messageDataType[]) => {
            setMessageData(messageData)
        })

        return () => {
            PubSub.unsubscribe(Pubsub.CHANGE_MESSAGE)
        }
    }, [])

    useEffect(() => {
        Ws.ws?.addEventListener('message', handle)

        function handle(e: MessageEvent) {
            const messageData = JSON.parse(window.sessionStorage.getItem(MESSAGE_DATA)!)
            const { text: data, name, imageUrl, date } = JSON.parse(e.data)
            messageData.push({
                data,
                name,
                imageUrl,
                date,
                target: false,
                type: MessageType.TEXT
            })
            window.sessionStorage.setItem(
                MESSAGE_DATA,
                JSON.stringify(messageData)
            )
            setMessageData(messageData)
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
                    switch(type) {
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
