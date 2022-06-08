import { message } from 'antd'

enum Status {
  SUCCESSFUL = 'successful',
  REJECTED = 'rejected'
}

class Notification {
  status?: Status
  constructor() {
    if (window.Notification) {
      this.permissionHandler(window.Notification.permission)
    } else {
      this.status = Status.REJECTED
      message.error('你的浏览器不支持Notification，后续无法使用信息提醒功能')
    }
  }
  private permissionHandler(permission: NotificationPermission): void {
    switch (permission) {
      case 'default':
        window.Notification.requestPermission(status => {
          if (status === "granted") {
            this.status = Status.SUCCESSFUL
            var n = new window.Notification("Hi!")
            console.log(n)
          } else {
            this.status = Status.REJECTED
          }
        })
        break
      case 'granted':
        this.status = Status.SUCCESSFUL
        break
      case 'denied':
        this.status = Status.REJECTED
        message.error('Notification未得到授权，后续无法使用信息提醒功能')
        break
    }
  }
  public message(
    title: string,
    body: string,
  ): void {
    if (this.status === Status.SUCCESSFUL) {
      new window.Notification(title, {
        body,
        icon: require('assets/img/logo.png'),
        image: require('assets/img/logo.png'),
      })
    }
  }
}

export default new Notification()
