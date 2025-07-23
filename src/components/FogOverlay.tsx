import { motion } from 'framer-motion'

export default function FogOverlay() {
  return (
    <motion.div
      className='pointer-events-none fixed inset-0 -z-20 fog-layer'
      initial={{ opacity: 0.2 }}
      animate={{ opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
