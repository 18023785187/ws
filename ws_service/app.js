const path = require('path')
const app = require('express')()
const http = require('http')
const WebSocket = require('ws')
const { v4 } = require('uuid')
const Event = require('./event')
const { sendTemp, getNetworkIp } = require('./utils')

const server = http.createServer(app)

const wss = new WebSocket.Server({
    server
})

wss.on('connection', (ws) => {
    // 监听客户端发来的消息
    ws.on('message', (message) => {
        // 对message过大的情况下采取分块传输
        message = JSON.parse(message)
        const { type, data } = message
        switch (type) {
            case Event.CONNECT:
                connectHandle(ws, data)
                break
            case Event.TEXT:
                textHandle(ws, data)
                break
            case Event.COUNT:
                countHandle(count)
                break
            default:
                break
        }
    })

    // 连接关闭
    ws.on('close', () => {
        // 广播人数
        let count = 0
        wss.clients.forEach(w => {
            if(w.name && w !== ws) {
                ++count
            }
        })
        countHandle(count)
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
    const { name, imageUrl, id: iid } = data
    for (const ws of wss.clients) {
        if (ws.name === name) {
            target.send(sendTemp(
                Event.CONNECT,
                JSON.stringify({
                    connect: false,
                    id: ''
                })
            ))
            return
        }
    }
    const id = iid ? iid : v4()
    target.send(sendTemp(
        Event.CONNECT,
        {
            connect: true,
            id
        }
    ))
    target.iid = id
    target.name = name
    target.imageUrl = imageUrl
    let count = 0
    // 广播进入
    const enterId = v4()
    wss.clients.forEach(ws => {
        if (ws.name) ++count
        if (ws !== target) {
            ws.send(sendTemp(
                Event.ENTER,
                {
                    name,
                    id: enterId,
                    date: Date.now()
                }
            ))
        }
    })
    // 广播人数
    countHandle(count)
}
// 处理文本信息
function textHandle(target, data) {
    wss.clients.forEach(ws => {
        if (ws !== target) {
            ws.send(sendTemp(
                Event.TEXT,
                {
                    ...data,
                    name: target.name,
                    imageUrl: target.imageUrl
                }
            ))
        }
    })
}
// 人数处理
function countHandle(curCount) {
    count = curCount
    wss.clients.forEach(ws => {
        ws.send(sendTemp(
            Event.COUNT,
            count
        ))
    })
}