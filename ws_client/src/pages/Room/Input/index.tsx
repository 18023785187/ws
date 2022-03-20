/**
 * 输入组件
 */
import { useState, useEffect, ChangeEvent } from 'react'
import { Input as AntdInput, message as antdMessage } from 'antd'
import PubSub from 'pubsub-js'
import Ws, { WsEvent } from 'utils/ws'
import MessageType from '@/constants/messageType'
import { MESSAGE_DATA, USER_INFO } from '@/constants/sessionStorage'
import Pubsub from '@/constants/pubsub'

if (!window.sessionStorage.getItem(MESSAGE_DATA)) {
    window.sessionStorage.setItem(MESSAGE_DATA, '[]')
}

const { TextArea } = AntdInput

function Input() {
    const [message, setMessage] = useState<string>('')
    const [sendFlag, setSendFlag] = useState<boolean>(false)

    useEffect(() => {
        Ws.ws?.addEventListener('message', (e) => {
            console.log(e)
        })
    }, [])

    const inputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value) {
            setSendFlag(true)
        } else {
            setSendFlag(false)
        }
        setMessage(e.target.value)
    }
    const send = (e: any) => {
        e.preventDefault()
        if (!message) {
            antdMessage.error('文本不能为空')
            return
        }
        const date = Date.now()
        const user_info = JSON.parse(window.sessionStorage.getItem(USER_INFO)!)
        const messageData = JSON.parse(window.sessionStorage.getItem(MESSAGE_DATA)!)
        messageData.push({
            type: MessageType.TEXT,
            target: true,
            ...user_info,
            data: message,
            date
        })
        Ws.ws?.send(JSON.stringify({
            type: WsEvent.MESSAGE,
            data: {
                text: message,
                date
            }
        }))
        window.sessionStorage.setItem(
            MESSAGE_DATA,
            JSON.stringify(messageData)
        )
        PubSub.publish(Pubsub.CHANGE_MESSAGE, messageData)
        setMessage('')
    }

    return (
        <div className='input'>
            <div className='input-left'>
                <div className='iconfont sound'>&#xe77b;</div>
            </div>
            <TextArea
                className='textarea'
                size='large'
                autoSize={{ minRows: 1, maxRows: 5 }}
                maxLength={200}
                value={message}
                onChange={inputChange}
                onPressEnter={send}
            />
            <div className='input-right'>
                <div className='iconfont'>&#xe67e;</div>
                <div
                    style={sendFlag ? { width: 0, visibility: 'hidden', opacity: 0 } : {}}
                    className='iconfont add'
                >&#xe664;</div>
                <div
                    style={sendFlag ? {} : { width: 0, visibility: 'hidden', opacity: 0 }}
                    className='send-btn'
                    title='发送'
                    onClick={send}
                >发送</div>
            </div>
        </div>
    )
}

export default Input
