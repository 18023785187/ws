import { message } from 'antd'
import IndexedDB, { Tabel } from '@/utils/indexedDB'
import { WS_SERVICE_URL, CONNECT_TOKEN, DISCONNECT, USER_INFO } from '@/constants/sessionStorage'

enum WsEvent {
  CONNECT = 'connect', // 连接
  TEXT = 'text', // 普通文本
  IMAGE = 'image', // 图片
  RECORD = 'record', // 录音
  COUNT = 'count', // 人数
  HEARTBEAT = 'heartbeat', // 心跳检测
  SHOW_MEMBER = 'show_member', // 获取所有人信息
}

class Ws {
  public ws?: WebSocket
  constructor() {
    const url = window.sessionStorage.getItem(WS_SERVICE_URL)
    if (!JSON.parse(window.sessionStorage.getItem(DISCONNECT) ?? 'false') && url) {
      this.createWebSocket(
        url,
        (e) => {
          console.log('websocket连接成功')
          const user_info = window.sessionStorage.getItem(USER_INFO)
          if (user_info) {
            this.connectSend(JSON.parse(user_info))
          }
        },
        (e) => {
          message.error('错误！服务器已断开连接', 2, auth)
        },
        () => {
          message.error('连接超时，正在断开连接', 2, auth)
        }
      )
    } else {
      window.sessionStorage.setItem(DISCONNECT, 'false')
      auth()
    }
  }
  /**
   * 创建一个webSocket实例
   * @param url ws服务器地址
   * @param onResolve 连接成功时的回调
   * @param onRejected 连接失败时的回调
   * @param onTimerOut 超时时的回调
   */
  public createWebSocket(
    url: string,
    onResolve?: (ev: Event) => void,
    onRejected?: (ev: Event) => void,
    onTimerOut?: () => void,
  ): void {
    // 成功回调
    const initOpen = (e: Event) => {
      window.clearTimeout(timer)
      ws.removeEventListener('open', initOpen)
      ws.removeEventListener('error', initError)
      ws.addEventListener('close', (e) => {
        if (!e.wasClean) {
          message.error('连接意外断开', 2, () => {
            window.sessionStorage.setItem(DISCONNECT, 'true')
            window.location.assign('/')
          })
        }
        this.ws = undefined
      })
      // 心跳检测
      this.ws?.addEventListener('message', (e) => {
        const { type, data } = JSON.parse(e.data)
        const { userIdList } = data
        if (type === WsEvent.HEARTBEAT) {
          IndexedDB.async(
            () => {
              IndexedDB.getAllKeyToTargetObjectStore(
                Tabel.MESSAGE,
                (tabel) => {
                  tabel.forEach(userId => {
                    if (!userIdList.includes(userId)) {
                      IndexedDB.deleteDataToTargetObjectStore(Tabel.MESSAGE, userId)
                    }
                  })
                }
              )
            }
          )
        }
      })
      this.ws = ws
      onResolve ? onResolve(e) : (() => { })()
    }
    // 失败回调
    const initError = (e: Event) => {
      ws.removeEventListener('open', initOpen)
      ws.removeEventListener('error', initError)
      onRejected ? onRejected(e) : (() => { })()
      window.clearTimeout(timer)
    }

    const ws = new WebSocket(url)
    ws.addEventListener('open', initOpen)
    ws.addEventListener('error', initError)
    const timer = window.setTimeout(onTimerOut ? onTimerOut : () => { }, 10000)
    this.ws = ws
  }
  /**
   * 向服务器发送信息
   * @param type 事件类型
   * @param info 信息，一般是一个对象
   */
  public send(type: WsEvent, info: any): void {
    if (!this.ws) {
      throw new Error('未连接WebSrocket！！')
    }
    this.ws.send(JSON.stringify({
      type,
      data: info
    }))
  }
  /**
   * 向服务器发送连接信息
   * @param info 信息，一般是一个对象
   */
  public connectSend(info: {
    id?: string,
    name: string,
    imageUrl: string | null,
  }): void {
    this.send(WsEvent.CONNECT, info)
  }

  /**
   * 断开
   */
  public disconnect(): void {
    this.ws = undefined
  }
}

/**
 * 重定向
 */
function auth(): void {
  window.sessionStorage.setItem(CONNECT_TOKEN, 'false')
  window.location.pathname !== '/' && window.location.assign('/')
}

export default new Ws()
export {
  WsEvent
}
