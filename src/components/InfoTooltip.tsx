import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  text: string
  children?: React.ReactNode
}

export default function InfoTooltip({ text, children }: Props) {
  const [show, setShow] = React.useState(false)
  const timer = React.useRef<NodeJS.Timeout>()
  const handleEnter = () => {
    timer.current = setTimeout(() => setShow(true), 150)
  }
  const handleLeave = () => {
    if (timer.current) clearTimeout(timer.current)
    setShow(false)
  }
  return (
    <span
      className='relative inline-block'
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      onTouchStart={() => setShow(s => !s)}
    >
      {children || <span className='ml-1 cursor-help select-none text-sand'>ℹ️</span>}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='absolute left-1/2 z-50 mt-1 w-56 -translate-x-1/2 whitespace-normal break-words rounded-md bg-black/80 p-2 text-xs text-white backdrop-blur'
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
