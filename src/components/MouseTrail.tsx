import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface TrailDot {
  x: number
  y: number
  id: number
}

const MouseTrail: React.FC = () => {
  const [dots, setDots] = useState<TrailDot[]>([])
  const [isVisible, setIsVisible] = useState(false)
  
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 700 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    let dotId = 0
    
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true)
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      
      setDots(prev => {
        const newDots = [...prev, { x: e.clientX, y: e.clientY, id: dotId++ }]
        return newDots.slice(-12) // Keep last 12 dots
      })
    }
    
    const handleMouseLeave = () => setIsVisible(false)
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [cursorX, cursorY])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Main cursor */}
      <motion.div
        className="absolute w-4 h-4 bg-psychedelic-purple/60 rounded-full mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%'
        }}
      />
      
      {/* Trail dots */}
      {dots.map((dot, index) => (
        <motion.div
          key={dot.id}
          className="absolute w-2 h-2 bg-psychedelic-pink/40 rounded-full"
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ 
            opacity: 0, 
            scale: 0,
            x: dot.x - 4,
            y: dot.y - 4
          }}
          transition={{ 
            duration: 0.5,
            delay: index * 0.05,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

export default MouseTrail
