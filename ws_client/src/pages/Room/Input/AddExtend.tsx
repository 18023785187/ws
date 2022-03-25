import { useEffect } from 'react'
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

function AddExtend() {

    // 发送选中相片时间
    useEffect(() => {
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
    }, [])

    const imgClick = () => {
        imageInput.click()
    }

    return (
        <div className="add-extend">
            {
                new Array(50).fill(0).map((_, i) => (
                    <div className="add-extend-item" key={i}>
                        <div className="add-extend-item-img" onClick={imgClick}>

                        </div>
                        <p className="add-extend-item-title">相册</p>
                    </div>
                ))
            }
        </div>
    )
}

export default AddExtend
