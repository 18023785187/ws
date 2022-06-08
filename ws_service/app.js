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
const userIdSet = new Set()

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
      case Event.IMAGE:
        imageHandle(ws, data)
        break
      case Event.RECORD:
        recordHandle(ws, data)
        break
      case Event.COUNT:
        countHandle(count)
        break
      case Event.SHOW_MEMBER:
        memberHandle()
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
      if (w.name && w !== ws) {
        ++count
      }
    })
    // 用户断开连接，将会有30秒保活时间
    const iid = ws.iid
    setTimeout(() => {
      let flag = true
      wss.clients.forEach(ws => {
        if (ws.iid === iid) {
          flag = false
        }
      })
      if (flag) {
        userIdSet.delete(iid)
        console.log(`id:${iid} close`)
      }
    }, 30000)
    countHandle(count)
    memberHandle()
  })
})

// 服务器启动的每30秒都会发送在线人员名单给客户端核对已删除不在线人员的聊天数据
setInterval(() => {
  wss.clients.forEach(ws => {
    ws.send(sendTemp(
      Event.HEARTBEAT,
      {
        userIdList: [...userIdSet]
      }
    ))
  })
}, 30000)

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

//监听端口
const port = process.env.PORT || 8000
const host = getNetworkIp()
// const host = 'localhost'
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
  console.log(`id:${id} connect`)
  userIdSet.add(id)
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
  // 发送在线人员
  memberHandle()
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
// 图片信息
function imageHandle(target, data) {
  wss.clients.forEach(ws => {
    if (ws !== target) {
      ws.send(sendTemp(
        Event.IMAGE,
        {
          ...data,
          name: target.name,
          imageUrl: target.imageUrl
        }
      ))
    }
  })
}
// 录音信息
function recordHandle(target, data) {
  wss.clients.forEach(ws => {
    if (ws !== target) {
      ws.send(sendTemp(
        Event.RECORD,
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
// 发送全员信息
function memberHandle() {
  const userInfoList = []
  wss.clients.forEach(ws => {
    if (ws.name) {
      userInfoList.push({
        name: ws.name,
        imageUrl: ws.imageUrl
      })
    }
  })
  wss.clients.forEach(ws => {
    ws.send(sendTemp(
      Event.SHOW_MEMBER,
      {
        userInfoList
      }
    ))
  })
}