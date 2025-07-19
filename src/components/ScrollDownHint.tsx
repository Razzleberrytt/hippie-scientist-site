import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface Props {
  targetId?: string
}

export default function ScrollDownHint({ targetId = 'featured-herb-carousel' }: Props) {
  const handleClick = () => {
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      initial={{ y: 0 }}
      animate={{ y: [0, 10, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className='absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-md hover:scale-105'
      aria-label='Scroll down'
    >
      <ChevronDown className='h-6 w-6' />
    </motion.button>
  )
}
