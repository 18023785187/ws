/**
 * 事件标识
 */

const Event = {
    CONNECT: 'connect', // 连接事件，用于注册用户信息
    TEXT: 'text', // 文本信息
    IMAGE: 'image', // 图片信息
    RECORD: 'record', // 录音信息
    COUNT: 'count', // 人数
    ENTER: 'enter', // 进入
    HEARTBEAT: 'heartbeat', // 心跳检测
    SHOW_MEMBER: 'show_member', // 所有人信息
}

module.exports = Event
