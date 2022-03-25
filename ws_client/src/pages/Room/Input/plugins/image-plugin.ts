/**
 * 图片发送功能
 */
import PubSub from 'pubsub-js'
import { v4 } from 'uuid'
import Ws, { WsEvent } from 'utils/ws'
import IndexedDB, { Tabel } from '@/utils/indexedDB'
import MessageType from '@/constants/messageType'
import { USER_INFO } from '@/constants/sessionStorage'
import Pubsub from '@/constants/pubsub'

const imageInput = document.createElement('input')
imageInput.setAttribute('type', 'file')
imageInput.setAttribute('accept', 'image/*')

function imagePlugin(): () => void {
    imageInput.addEventListener('change', imageInputChange)

    function imageInputChange(e: Event) {
        if (imageInput.value) {
            const reads = new FileReader()
            reads.readAsDataURL((e.target as any).files![0])
            reads.onload = function (e) {
                const imageUrl = this.result

                const imageId = v4()
                IndexedDB.async(
                    () => {
                        const date = Date.now()
                        const user_info = JSON.parse(window.sessionStorage.getItem(USER_INFO)!)
                        IndexedDB.putDataToTargetObjectStore(
                            Tabel.MESSAGE,
                            user_info.id,
                            (prevData, next) => {
                                prevData.push({
                                    type: MessageType.IMAGE,
                                    target: true,
                                    ...user_info,
                                    id: imageId,
                                    data: imageUrl,
                                    date
                                })
                                next(prevData)
                            },
                            () => {
                                Ws.ws?.send(JSON.stringify({
                                    type: WsEvent.IMAGE,
                                    data: {
                                        id: imageId,
                                        data: imageUrl,
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
    }

    return () => {
        imageInput.removeEventListener('change', imageInputChange)
    }
}

export default imagePlugin
export {
    imageInput
}
