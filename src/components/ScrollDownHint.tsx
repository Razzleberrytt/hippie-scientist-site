import React from 'react'
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
    <button
      onClick={handleClick}
      className='absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-md transition motion-safe:animate-bounce motion-safe:hover:scale-105'
      aria-label='Scroll down'
    >
      <ChevronDown className='h-6 w-6' />
    </button>
  )
}
