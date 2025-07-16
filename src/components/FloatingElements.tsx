import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

const FloatingElements: React.FC = () => {
  const elements = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 60 + 20,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 12 + 12,
        delay: Math.random() * 5,
      })),
    []
  )

  return (
    <div className='pointer-events-none fixed inset-0 overflow-hidden' aria-hidden='true'>
      {elements.map(element => (
        <motion.div
          key={element.id}
          className='absolute rounded-full blur-2xl'
          style={{
            width: element.size,
            height: element.size,
            left: `${element.x}%`,
            top: `${element.y}%`,
            background: `radial-gradient(circle, rgba(67, 56, 202, 0.2), transparent 70%)`,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 40, 0],
            rotate: [0, 60, -60, 0],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default FloatingElements
