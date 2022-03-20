import { useState, ChangeEvent } from 'react'
import { Input as AntdInput } from 'antd'

const { TextArea } = AntdInput

function Input() {
    const [message, setMessage] = useState<string>('')
    const [sendFlag, setSendFlag] = useState<boolean>(false)

    const inputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value) {
            setSendFlag(true)
        } else {
            setSendFlag(false)
        }
        setMessage(e.target.value)
    }
    const send = (e: any) => {
        e.preventDefault()
        console.log('send')
    }

    return (
        <div className='input'>
            <div className='input-left'>
                <div className='iconfont sound'>&#xe77b;</div>
            </div>
            <TextArea
                className='textarea'
                size='large'
                autoSize={{ minRows: 1, maxRows: 5 }}
                maxLength={200}
                value={message}
                onChange={inputChange}
                onPressEnter={send}
            />
            <div className='input-right'>
                <div className='iconfont'>&#xe67e;</div>
                <div
                    style={sendFlag ? { width: 0, visibility: 'hidden', opacity: 0 } : {}}
                    className='iconfont add'
                >&#xe664;</div>
                <div
                    style={sendFlag ? {} : { width: 0, visibility: 'hidden', opacity: 0 }}
                    className='send-btn'
                    title='发送'
                    onClick={send}
                >发送</div>
            </div>
        </div>
    )
}

export default Input
