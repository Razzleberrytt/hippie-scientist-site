import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  text: string
  children?: React.ReactNode
}

export default function InfoTooltip({ text, children }: Props) {
  const [show, setShow] = React.useState(false)
  const timer = React.useRef<NodeJS.Timeout>()

  const showWithDelay = () => {
    timer.current = setTimeout(() => setShow(true), 150)
  }
  const hide = () => {
    if (timer.current) clearTimeout(timer.current)
    setShow(false)
  }

  return (
    <span
      className='relative inline-block'
      onMouseEnter={showWithDelay}
      onMouseLeave={hide}
      onFocus={showWithDelay}
      onBlur={hide}
      onTouchStart={() => setShow(s => !s)}
    >
      {children || <span className='ml-1 cursor-help select-none text-sand'>ℹ️</span>}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className='absolute left-1/2 z-50 mt-1 max-w-[90vw] -translate-x-1/2 whitespace-pre-line break-words rounded-md bg-black/80 p-2 text-xs text-white backdrop-blur sm:max-w-xs'
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
