import React, { useMemo } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const HeroBackground: React.FC = () => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const width = typeof window !== 'undefined' ? window.innerWidth : 1
  const height = typeof window !== 'undefined' ? window.innerHeight : 1
  const parallaxX = useTransform(mouseX, [0, width], [-30, 30])
  const parallaxY = useTransform(mouseY, [0, height], [-30, 30])

  const particles = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
      })),
    []
  )

  return (
    <motion.div
      className='absolute inset-0 -z-10 overflow-hidden'
      onMouseMove={e => {
        mouseX.set(e.clientX)
        mouseY.set(e.clientY)
      }}
    >
      {particles.map(p => (
        <motion.span
          key={p.id}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          className='absolute rounded-full bg-forest-green/20'
          animate={{ y: [-10, 10, -10] }}
          transition={{
            duration: 8,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
      <motion.div
        className='bg-cosmic-gradient animate-gradient absolute inset-0'
        style={{ x: parallaxX, y: parallaxY }}
      />
    </motion.div>
  )
}

export default HeroBackground
