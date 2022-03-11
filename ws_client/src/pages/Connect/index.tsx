/**
 * 链接页
 */
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Select, Button, message } from 'antd'
import Ws from 'utils/ws'
import style from './style/index.module.less'

const Option = Select.Option

message.config({
    maxCount: 1
})

function Connect() {
    const [protocol, setProtocol] = useState<string>('ws://')
    const [inputValue, setInputValue] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const navigate = useNavigate()

    // 链接
    const connect = () => {
        if (!inputValue) {
            message.error('服务器地址不能为空！')
            return
        }
        setLoading(true)
        const url = protocol + inputValue
        Ws.createWebSocket(
            url,
            (e) => {
                setLoading(false)
                message.success('连接成功', 2, () => navigate('/setting'))
            },
            (e) => {
                setLoading(false)
                message.error('连接失败，请重新连接')
            },
            () => {
                setLoading(false)
                message.error('连接超时，请重新连接')
            }
        )
    }
    // input双向绑定
    const inputChange = (e: any) => {
        setInputValue(e!.target!.value)
    }

    // 选择协议组件
    const SelectBefore = useMemo(
        () => (
            <Select defaultValue="ws://" style={{ width: 80 }} onChange={(val) => { setProtocol(val) }}>
                <Option value="ws://">ws://</Option>
                <Option value="wss://">wss://</Option>
            </Select>
        )
        , []
    )

    return (
        <div className={`${style['connect']} clearfix`}>
            <div className='connect-content'>
                <h2 className='connect-title'>即时聊天室</h2>
                <Input
                    size='large'
                    placeholder="请输入服务器地址"
                    addonBefore={SelectBefore}
                    value={inputValue}
                    onChange={inputChange}
                    onPressEnter={connect}
                />
                <Button
                    style={useMemo(() => ({ width: '100%' }), [])}
                    size='large'
                    type="primary"
                    loading={loading}
                    onClick={connect}
                >
                    连接
                </Button>
            </div>
        </div>
    );
}

export default Connect