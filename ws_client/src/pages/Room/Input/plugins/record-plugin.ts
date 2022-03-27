/**
 * 音频录制功能
 */
import { message } from 'antd'
import PubSub from 'pubsub-js'
import { v4 } from 'uuid'
import Ws, { WsEvent } from 'utils/ws'
import IndexedDB, { Tabel } from '@/utils/indexedDB'
import MessageType from '@/constants/messageType'
import { USER_INFO } from '@/constants/sessionStorage'
import Pubsub from '@/constants/pubsub'

function recordPlugin(
    acion: (handler: { start: () => void, commit: () => void, discommit: () => void }) => void
): void {
    if (navigator?.mediaDevices?.getUserMedia) {
        const constraints = { audio: true }
        navigator.mediaDevices.getUserMedia(constraints).then(
            stream => {
                const mediaRecorder = new MediaRecorder(stream)
                let flag: boolean = true
                const handler = {
                    start: () => { mediaRecorder.start() },
                    commit: () => {
                        flag = true
                        mediaRecorder.stop()
                    },
                    discommit: () => {
                        flag = false
                        mediaRecorder.stop()
                    }
                }
                acion(handler)

                const chunks: Blob[] = []
                mediaRecorder.ondataavailable = e => {
                    chunks.push(e.data)
                }
                mediaRecorder.onstop = e => {
                    if (!flag) {
                        chunks.length = 0
                        return
                    }
                    const blob = new Blob(chunks, { type: "audio/mpeg" })
                    chunks.length = 0
                    const fr = new FileReader()
                    console.log(fr)
                    fr.readAsDataURL(blob)
                    fr.onload = function (e) {
                        const audioURL = e.target!.result
                        // 录完音发送信息
                        const recordId = v4()
                        IndexedDB.async(
                            () => {
                                const date = Date.now()
                                const user_info = JSON.parse(window.sessionStorage.getItem(USER_INFO)!)
                                IndexedDB.putDataToTargetObjectStore(
                                    Tabel.MESSAGE,
                                    user_info.id,
                                    (prevData, next) => {
                                        prevData.push({
                                            type: MessageType.RECORD,
                                            target: true,
                                            ...user_info,
                                            id: recordId,
                                            data: audioURL,
                                            date
                                        })
                                        next(prevData)
                                    },
                                    () => {
                                        Ws.ws?.send(JSON.stringify({
                                            type: WsEvent.RECORD,
                                            data: {
                                                id: recordId,
                                                data: audioURL,
                                                date
                                            }
                                        }))
                                        PubSub.publish(Pubsub.CHANGE_MESSAGE)
                                    }
                                )
                            }
                        )
                    }
                }
            },
            () => {
                message.error("授权失败！")
            }
        )
    } else {
        message.error('你的浏览器不支持录音功能，后续无法使用与音频相关的功能')
    }
}

export default recordPlugin
