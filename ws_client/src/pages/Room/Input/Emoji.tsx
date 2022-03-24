import emoji from '@/constants/emoji'

interface IProps {
    onChange: (emoji: string) => void
}

const dom = document.createElement('span')

function Emoji(props: IProps) {

    const click = (emojiHex: string) => {
        dom.innerHTML = emojiHex
        props.onChange(dom.textContent!)
    }

    return (
        <div className='emoji'>
            <div className='emoji-content'>
                {
                    emoji.map((item, index) => {
                        return <span
                            key={`${item}-${index}`}
                            dangerouslySetInnerHTML={{ __html: item }}
                            onClick={() => click(item)}
                        ></span>
                    })
                }
            </div>
        </div>
    )
}

export default Emoji
