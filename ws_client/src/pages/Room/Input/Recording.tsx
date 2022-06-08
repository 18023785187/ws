/**
 * 录音交互界面
 */
import { useState, memo, useImperativeHandle, forwardRef, useEffect } from 'react'

interface IProps {
  commit: () => void,
  discommit: () => void
}

interface IRecordingRef {
  open: () => void
}

export default memo(forwardRef<IRecordingRef, IProps>(
  function Recording(props, ref) {
    const { commit, discommit } = props
    const [open, setOpen] = useState<boolean>(false)
    const [isCommit, setIsCommit] = useState<boolean>(true)

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true)
        setIsCommit(true)
      }
    }))

    useEffect(() => {
      // window.addEventListener('touchend', handleTouch)
      window.addEventListener('mouseup', handleMouse)

      // function handleTouch(e: TouchEvent): void {
      //     if (open && window.isMobile) {
      //         isCommit ? commit() : discommit()
      //         setOpen(false)
      //     }
      // }
      function handleMouse(e: MouseEvent): void {
        if (open && !window.isMobile) {
          isCommit ? commit() : discommit()
          setOpen(false)
        }
      }

      return () => {
        // window.removeEventListener('touchend', handleTouch)
        window.removeEventListener('mouseup', handleMouse)
      }
    }, [isCommit, open])

    return (
      <div
        className={`recording-show discommit no-select ${isCommit ? '' : 'high-discommit'}`}
        style={{ zIndex: open ? '9' : '-9' }}
        onMouseMove={() => setIsCommit(false)}
        onTouchMove={() => setIsCommit(false)}
        onTouchEnd={(e) => {
          e.stopPropagation()
          if (open && window.isMobile) {
            discommit()
            setOpen(false)
          }
        }}
      >
        <p className='iconfont cancel-icon'>&#xe6fe;</p>
        <p className='iscommit'>{window.isMobile ? '点击喇叭' : '松开'} {isCommit ? '发送' : '取消'}</p>
        <div
          className={`commit ${isCommit ? '' : 'high-commit'}`}
          style={{ top: open ? '77%' : '100%' }}
          onMouseMove={(e) => { e.stopPropagation(); setIsCommit(true) }}
          onMouseEnter={(e) => { e.stopPropagation(); setIsCommit(true) }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            if (open && window.isMobile) {
              commit()
              setOpen(false)
            }
          }}
        >
          <p className='iconfont voice-icon'>&#xe604;</p>
        </div>
      </div>
    )
  }
))

export type {
  IRecordingRef
}
