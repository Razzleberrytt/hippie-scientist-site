import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const MouseTrail: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 700 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  useEffect(() => {
    const updatePosition = (e: MouseEvent | TouchEvent) => {
      const xPos = 'touches' in e ? e.touches[0].clientX : e.clientX
      const yPos = 'touches' in e ? e.touches[0].clientY : e.clientY
      mouseX.set(xPos)
      mouseY.set(yPos)
      setIsVisible(true)
    }

    const endTrail = () => {
      setIsVisible(false)
    }

    const opts = { passive: true }
    document.addEventListener('mousemove', updatePosition, opts)
    document.addEventListener('touchstart', updatePosition, opts)
    document.addEventListener('touchmove', updatePosition, opts)
    document.addEventListener('mouseleave', endTrail, opts)
    document.addEventListener('touchend', endTrail, opts)
    document.addEventListener('touchcancel', endTrail, opts)

    return () => {
      document.removeEventListener('mousemove', updatePosition)
      document.removeEventListener('touchstart', updatePosition)
      document.removeEventListener('touchmove', updatePosition)
      document.removeEventListener('mouseleave', endTrail)
      document.removeEventListener('touchend', endTrail)
      document.removeEventListener('touchcancel', endTrail)
    }
  }, [mouseX, mouseY])

  return (
    <motion.div
      className='pointer-events-none fixed left-0 top-0 z-50 h-6 w-6'
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className='bg-rainbow-gradient animate-sparkle h-full w-full rounded-full opacity-70 blur-md' />
    </motion.div>
  )
}

export default MouseTrail
