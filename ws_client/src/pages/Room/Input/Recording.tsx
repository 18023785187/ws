/**
 * 录音交互界面
 */
import { useState, memo, useImperativeHandle, forwardRef } from 'react'
import type { MouseEvent, TouchEvent } from 'react'

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

        useImperativeHandle(ref, () => ({
            open: () => {
                setOpen(true)
            }
        }))

        const commitUp1 = (e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation()
            if(!window.isMobile) {
                setOpen(false)
            }
            commit()
        }
        const commitUp2 = (e: TouchEvent<HTMLDivElement>) => {
            e.stopPropagation()
            if(window.isMobile) {
                setOpen(false)
            }
            commit()
        }
        const discommitUp1 = (e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation()
            if(!window.isMobile) {
                setOpen(false)
            }
            discommit()
        }
        const discommitUp2 = (e: TouchEvent<HTMLDivElement>) => {
            e.stopPropagation()
            if(window.isMobile) {
                setOpen(false)
            }
            discommit()
        }

        return (
            <div
                className="recording-show discommit"
                style={{ top: open ? '0' : '100%' }}
                onMouseUp={window.isMobile ? () => {} : discommitUp1}
                onTouchEnd={window.isMobile ? discommitUp2 : () => {}}
            >
                <div
                    className='commit'
                    onMouseUp={window.isMobile ? () => {} : commitUp1}
                    onTouchEnd={window.isMobile ? commitUp2 : () => {}}
                ></div>
            </div>
        )
    }
))

export type {
    IRecordingRef
}
