/**
 * 弹窗
 */
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'

interface IProps {

}

interface IPopUpRef {
    open: () => void
}

export default forwardRef<IPopUpRef, IProps>(
    function PopUp(props, ref) {
        const [open, setOpen] = useState<boolean>(false)

        useImperativeHandle(ref, () => ({
            open: () => {
                setOpen(true)
            }
        }))

        useEffect(() => {
            window.addEventListener('mousedown', mousedown)

            function mousedown() {
                setOpen(false)
            }

            return () => {
                window.removeEventListener('mousedown', mousedown)
            }
        }, [])

        return (
            <div
                className="pop-up"
                style={open ? { height: '40vh' } : { height: '0' }}
                onMouseDown={(e) => e.stopPropagation()}
            >

            </div>
        )
    }
)
export type {
    IPopUpRef
}
