import React from 'react'
import { motion } from 'framer-motion'

const FloatingElements: React.FC = () => {
  const shapes = Array.from({ length: 6 }, (_, i) => i)
  const particles = Array.from({ length: 20 }, (_, i) => i)

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Shapes */}
      {shapes.map((_, index) => (
        <motion.div
          key={`shape-${index}`}
          className="floating-shape"
          style={{
            width: `${60 + index * 20}px`,
            height: `${60 + index * 20}px`,
            left: `${10 + index * 15}%`,
            top: `${20 + index * 10}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
          }}
        />
      ))}

      {/* Floating Particles */}
      {particles.map((_, index) => (
        <motion.div
          key={`particle-${index}`}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}

export default FloatingElements
