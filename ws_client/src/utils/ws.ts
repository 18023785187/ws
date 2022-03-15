
class Ws {
    public ws?: WebSocket
    /**
     * 创建一个webSocket实例
     * @param url ws服务器地址 
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
            this.ws = ws
            onResolve ? onResolve(e) : (() => { })()
        }
        // 失败回调
        const initError = (e: Event) => {
            ws.removeEventListener('open', initOpen)
            ws.removeEventListener('error', initError)
            onRejected ? onRejected(e) : (() => { })()
        }

        const ws = new WebSocket(url) 
        ws.addEventListener('open', initOpen)
        ws.addEventListener('error', initError)
        const timer = setTimeout(onTimerOut ? onTimerOut : () => {}, 10000)
    }

    // const ws = new WebSocket('ws://' + inputValue)

    // // 连接成功
    // ws.onopen = () => {
    //     console.log('连接服务端WebSocket成功')
    //     ws.send('__IS_HYM_WEB_SOCKET?__')
    // };

    // // 监听服务端消息
    // ws.onmessage = (msg) => {
    //     console.log(msg)
    // };

    // // 连接失败
    // ws.onerror = () => {
    //     console.log('连接失败，正在重连...');
    // };

    // // 连接关闭
    // ws.onclose = () => {
    //     console.log('连接关闭');
    // };
}

export default new Ws()
