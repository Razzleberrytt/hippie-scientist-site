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

    window.addEventListener('mousemove', updatePosition)
    window.addEventListener('touchstart', updatePosition)
    window.addEventListener('touchmove', updatePosition)
    window.addEventListener('mouseleave', endTrail)
    window.addEventListener('touchend', endTrail)
    window.addEventListener('touchcancel', endTrail)

    return () => {
      window.removeEventListener('mousemove', updatePosition)
      window.removeEventListener('touchstart', updatePosition)
      window.removeEventListener('touchmove', updatePosition)
      window.removeEventListener('mouseleave', endTrail)
      window.removeEventListener('touchend', endTrail)
      window.removeEventListener('touchcancel', endTrail)
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
