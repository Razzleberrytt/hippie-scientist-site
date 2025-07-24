import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const title = document.getElementById('site-title')
    if (title) {
      title.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
        { duration: 600, easing: 'ease-out' }
      )
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      className='bounce fixed bottom-6 right-6 z-40 rounded-full bg-psychedelic-purple p-3 text-white shadow-lg hover:scale-105'
      aria-label='Scroll to top'
    >
      <ArrowUp />
    </motion.button>
  )
}
