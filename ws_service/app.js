const path = require('path')
const app = require('express')()
const http = require('http')
const WebSocket = require('ws')
const getNetworkIp = require('./utils/getNetworkIp')

const server = http.createServer(app)

const wss = new WebSocket.Server({
    server
})

wss.on('connection', (ws) => {
    
    // 监听客户端发来的消息
    ws.on('message', (message) => {
        // console.log(Object.prototype.toString.call(message))
        // console.log(String.fromCharCode.apply(null, new Uint8Array(message)))
        // if(String.fromCharCode.apply(null, new Uint8Array(message)) === 'IS_HYM_WEB_SOCKET?') {
        //     ws.send()
        // }
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
        console.log('连接关闭')
    })
})

const port = process.env.PORT || 8000
const host = getNetworkIp()

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

//监听端口
server.listen(port, host, () => {
    console.log(`服务器跑起来了~ @ http://${host}:${port}`)
})
