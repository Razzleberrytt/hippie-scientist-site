import { motion } from '@/lib/motion'

export default function FogOverlay() {
  return (
    <motion.div
      className='fog-layer pointer-events-none fixed inset-0 -z-20'
      initial={{ opacity: 0.2 }}
      animate={{ opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
