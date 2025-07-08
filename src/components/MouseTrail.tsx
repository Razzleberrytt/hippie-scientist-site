import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface TrailDot {
  x: number
  y: number
  id: number
  timestamp: number
}

const MouseTrail: React.FC = () => {
  const [dots, setDots] = useState<TrailDot[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const addDot = useCallback((x: number, y: number) => {
    const newDot: TrailDot = {
      x,
      y,
      id: Date.now() + Math.random(),
      timestamp: Date.now()
    }
    
    setDots(prev => {
      const filtered = prev.filter(dot => Date.now() - dot.timestamp < 800)
      return [...filtered, newDot].slice(-12)
    })
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true)
      addDot(e.clientX, e.clientY)
    }
    
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [addDot])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {dots.map((dot, index) => (
        <motion.div
          key={dot.id}
          className="absolute w-3 h-3 bg-psychedelic-pink/60 rounded-full"
          initial={{ 
            opacity: 0.8, 
            scale: 1,
            x: dot.x - 6,
            y: dot.y - 6
          }}
          animate={{ 
            opacity: 0, 
            scale: 0.3,
            x: dot.x - 6 + (Math.random() - 0.5) * 20,
            y: dot.y - 6 + (Math.random() - 0.5) * 20
          }}
          transition={{ 
            duration: 0.6,
            delay: index * 0.02,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Sparkle effects */}
      {dots.slice(-5).map((dot) => (
        <motion.div
          key={`sparkle-${dot.id}`}
          className="absolute w-1 h-1 bg-psychedelic-cyan rounded-full"
          initial={{ 
            opacity: 1, 
            scale: 0,
            x: dot.x - 2,
            y: dot.y - 2
          }}
          animate={{ 
            opacity: 0, 
            scale: 1,
            x: dot.x - 2 + (Math.random() - 0.5) * 30,
            y: dot.y - 2 + (Math.random() - 0.5) * 30
          }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

export default MouseTrail
