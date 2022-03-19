const path = require('path')
const app = require('express')()
const http = require('http')
const WebSocket = require('ws')
const Event = require('./event')
const { sendTemp, getNetworkIp, arrayBufferToStr } = require('./utils')

const server = http.createServer(app)

const wss = new WebSocket.Server({
    server
})

wss.on('connection', (ws) => {
    // 监听客户端发来的消息
    ws.on('message', (message) => {
        // 对message过大的情况下采取分块传输
        message = JSON.parse(arrayBufferToStr(message))
        const { type, data } = message
        switch (type) {
            case Event.CONNECT:
                connectHandle(ws, data)
                break
            case Event.MESSAGE:

                break
            default:
                break
        }
        // let msgData = JSON.parse(message)
        // if (msgData.type === 'open') {
        //     // 初始连接时标识会话
        //     ws.sessionId = `${msgData.fromUserId}-${msgData.toUserId}`
        // } else {
        //     let sessionId = `${msgData.toUserId}-${msgData.fromUserId}`
        //     wss.clients.forEach(client => {
        //         if (client.sessionId === sessionId) {
        //             client.send(message) // 给对应的客户端连接发送消息
        //         }
        //     })
        // }
    })

    // 连接关闭
    ws.on('close', () => {
        // console.log('连接关闭')
    })
})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

//监听端口
const port = process.env.PORT || 8000
const host = getNetworkIp()
server.listen(port, host, () => {
    console.log(`服务器跑起来了~ @ http://${host}:${port}`)
})

// 连接处理事件
function connectHandle(target, data) {
    const { name, imageUrl } = data
    for (const ws of wss.clients) {
        if (ws.name === name) {
            target.send(sendTemp(
                Event.CONNECT,
                false
            ))
            return
        }
    }

    target.send(sendTemp(
        Event.CONNECT,
        true
    ))
    target.name = name
    target.imageUrl = imageUrl
}
