/**
 * 输入组件
 */
import { useRef, useState, ChangeEvent, useMemo, useCallback, useEffect } from 'react'
import { Input as AntdInput, message as antdMessage } from 'antd'
import PubSub from 'pubsub-js'
import { v4 } from 'uuid'
import Ws, { WsEvent } from 'utils/ws'
import IndexedDB, { Tabel } from '@/utils/indexedDB'
import MessageType from '@/constants/messageType'
import { USER_INFO } from '@/constants/sessionStorage'
import Pubsub from '@/constants/pubsub'
import PopUp, { IPopUpRef } from './PopUp'
import Emoji from './Emoji'
import Add from './AddExtend'
import Recording, { IRecordingRef } from './Recording'
import recordPlugin from './plugins/record-plugin'

enum PopUpMode {
    EMOJI = 'emoji',
    ADD = 'add'
}

const { TextArea } = AntdInput

function Input() {
    const [message, setMessage] = useState<string>('')
    const [sendFlag, setSendFlag] = useState<boolean>(false)
    // 语音与键盘
    const [isFont, setIsFont] = useState<boolean>(true)
    // 发送控制阀
    const [flag, setFlag] = useState<boolean>(true)
    // 弹窗组件
    const popUpRef = useRef<IPopUpRef>(null)
    const [popUpMode, setPopUpMode] = useState<PopUpMode | ''>('')
    // 输入组件
    const inputRef = useRef<any>(null)
    // 音频组件
    const recordRef = useRef<HTMLDivElement>(null)
    const [mediaRecorderHandler, setMediaRecorderHandler] = useState<{ start: () => void, commit: () => void, discommit: () => void } | null>(null)
    const recordingRef = useRef<IRecordingRef>(null)

    // 输入框文本改变
    const inputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value) {
            setSendFlag(true)
        } else {
            setSendFlag(false)
        }
        setMessage(e.target.value)
    }
    // 发送
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
    // 录音处理
    useEffect(() => {
        recordPlugin((mediaRecorderHandler) => {
            recordRef.current?.addEventListener('mousedown', () => {
                if (!window.isMobile) {
                    mediaRecorderHandler.start()
                    recordingRef.current?.open()
                }
            })
            recordRef.current?.addEventListener('touchstart', () => {
                if (window.isMobile) {
                    mediaRecorderHandler.start()
                    recordingRef.current?.open()
                }
            })
            setMediaRecorderHandler(mediaRecorderHandler)
        })
    }, [])

    const PMode = useMemo(() => {
        switch (popUpMode) {
            case PopUpMode.EMOJI: {
                return <Emoji onChange={(emoji) => {
                    setMessage(message + emoji)
                    setSendFlag(true)
                }} />
            }
            case PopUpMode.ADD: {
                return <Add />
            }
            default: {
                return <></>
            }
        }
    }, [popUpMode, message])

    const popUpCloseCallback = useCallback(() => {
        setPopUpMode('')
    }, [])

    // 录音弹窗处理
    const commit = useCallback(() => {
        mediaRecorderHandler?.commit()
    }, [mediaRecorderHandler])
    const discommit = useCallback(() => {
        mediaRecorderHandler?.discommit()
    }, [mediaRecorderHandler])

    return (
        <>
            <div className='input'>
                {/* 左按钮 */}
                <div className='input-left'>
                    <div
                        className='iconfont sound'
                        dangerouslySetInnerHTML={{ __html: isFont ? '&#xe77b;' : '&#xe675;' }}
                        onClick={() => {
                            setIsFont(!isFont)
                            !isFont && inputRef.current!.focus()
                        }}
                    ></div>
                </div>
                {/* 操作栏 */}
                <TextArea
                    className='textarea'
                    style={{ position: isFont ? 'static' : 'absolute', bottom: isFont ? 0 : 10000 }}
                    size='large'
                    autoSize={{ minRows: 1, maxRows: 5 }}
                    maxLength={200}
                    value={message}
                    onChange={inputChange}
                    onPressEnter={send}
                    ref={inputRef}
                />
                <div
                    ref={recordRef}
                    className='recording'
                    style={{ position: isFont ? 'absolute' : 'static', bottom: isFont ? 10000 : 0 }}
                >按住&nbsp;说话</div>
                <Recording ref={recordingRef} commit={commit} discommit={discommit} />
                {/* 右按钮 */}
                <div className='input-right'>
                    <div
                        className='iconfont'
                        onMouseDown={(e) => { e.stopPropagation(); popUpRef.current?.open(); setPopUpMode(PopUpMode.EMOJI); setIsFont(true) }}
                    >&#xe67e;</div>
                    <div
                        style={sendFlag ? { width: 0, visibility: 'hidden', opacity: 0 } : {}}
                        className='iconfont add'
                        onMouseDown={(e) => { e.stopPropagation(); popUpRef.current?.open(); setPopUpMode(PopUpMode.ADD); setIsFont(true) }}
                    >&#xe664;</div>
                    <div
                        style={sendFlag ? {} : { width: 0, visibility: 'hidden', opacity: 0 }}
                        className='send-btn'
                        title='发送'
                        onClick={send}
                    >发送</div>
                </div>
            </div>
            {/* 下拉框 */}
            <PopUp ref={popUpRef} children={PMode} closeCallback={popUpCloseCallback} />
        </>
    )
}

export default Input
