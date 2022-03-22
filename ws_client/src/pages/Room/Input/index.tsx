/**
 * 输入组件
 */
import { useRef, useState, ChangeEvent } from 'react'
import { Input as AntdInput, message as antdMessage } from 'antd'
import PubSub from 'pubsub-js'
import { v4 } from 'uuid'
import Ws, { WsEvent } from 'utils/ws'
import IndexedDB, { Tabel } from '@/utils/indexedDB'
import MessageType from '@/constants/messageType'
import { USER_INFO } from '@/constants/sessionStorage'
import Pubsub from '@/constants/pubsub'
import PopUp, { IPopUpRef } from './PopUp'

const { TextArea } = AntdInput

function Input() {
    const [message, setMessage] = useState<string>('')
    const [sendFlag, setSendFlag] = useState<boolean>(false)
    // 发送控制阀
    const [flag, setFlag] = useState<boolean>(true)
    // 弹窗组件
    const popUpRef = useRef<IPopUpRef>(null)

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
        if (!flag) return
        if (!message) {
            antdMessage.error('文本不能为空')
            return
        }
        setFlag(false)
        const textId = v4()
        IndexedDB.async(
            () => {
                const date = Date.now()
                const user_info = JSON.parse(window.sessionStorage.getItem(USER_INFO)!)
                IndexedDB.putDataToTargetObjectStore(
                    Tabel.MESSAGE,
                    user_info.id,
                    (prevData, next) => {
                        prevData.push({
                            type: MessageType.TEXT,
                            target: true,
                            ...user_info,
                            id: textId,
                            data: message,
                            date
                        })
                        next(prevData)
                    },
                    () => {
                        Ws.ws?.send(JSON.stringify({
                            type: WsEvent.TEXT,
                            data: {
                                id: textId,
                                data: message,
                                date
                            }
                        }))
                        PubSub.publish(Pubsub.CHANGE_MESSAGE)
                        setMessage('')
                        setSendFlag(false)
                        setFlag(true)
                    }
                )
            }
        )
    }

    return (
        <>
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
                    <div
                        className='iconfont'
                        onMouseDown={(e) => { e.stopPropagation(); popUpRef.current?.open() }}
                    >&#xe67e;</div>
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
            <PopUp ref={popUpRef} />
        </>
    )
}

export default Input
