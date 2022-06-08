/**
 * 弹窗
 */
import { useState, useEffect, useImperativeHandle, forwardRef, memo } from 'react'

interface IProps {
  children: JSX.Element | Element
  closeCallback?: () => void
}

interface IPopUpRef {
  open: () => void
}

export default memo(forwardRef<IPopUpRef, IProps>(
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
        window.setTimeout(() => {
          props.closeCallback && props.closeCallback()
        }, 200)
      }

      return () => {
        window.removeEventListener('mousedown', mousedown)
      }
    }, [props.closeCallback])

    return (
      <div
        className="pop-up no-select"
        style={open ? { height: '40vh' } : { height: '0' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {props.children}
      </div>
    )
  }
))

export type {
  IPopUpRef
}
