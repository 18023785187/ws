/**
 * 链接页
 */
import { useState } from 'react'
import { Input, Select, Button } from 'antd'
import style from './style/index.module.less'

const Option = Select.Option

const selectBefore = (
    <Select defaultValue="ws://" style={{ width: 80 }}>
        <Option value="ws://">ws://</Option>
        <Option value="wss://">wss://</Option>
    </Select>
)

function Connect() {
    const [inputValue, setInputValue] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const connect = () => {
        const ws = new WebSocket('ws://' + inputValue)

        // 连接成功
        ws.onopen = () => {
            console.log('连接服务端WebSocket成功')
            ws.send('__IS_HYM_WEB_SOCKET?__')
        };

        // 监听服务端消息
        ws.onmessage = (msg) => {
            console.log(msg)
        };

        // 连接失败
        ws.onerror = () => {
            console.log('连接失败，正在重连...');
        };

        // 连接关闭
        ws.onclose = () => {
            console.log('连接关闭');
        };
    }
    const inputChange = (e: any) => {
        console.log(e!.target!.value)
        setInputValue(e!.target!.value)
    }

    return (
        <div className={style['connect']}>
            <h2>即时聊天室</h2>
            <Input
                size='large'
                placeholder="请输入服务器地址"
                addonBefore={selectBefore}
                value={inputValue}
                onChange={inputChange}
            />
            <Button
                style={{ width: '100%' }}
                size='large'
                type="primary"
                loading={loading}
                onClick={connect}
            >连接</Button>
        </div>
    );
}

export default Connect