import React from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
}

const PanelWrapper: React.FC<Props> = ({ children, className }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`neon-card soft-border-glow relative my-12 overflow-hidden rounded-xl p-6 ${className ?? ''}`}
  >
    <div className='absolute inset-x-0 top-0 h-px animate-pulse bg-gradient-to-r from-transparent via-lichen/30 to-transparent' />
    {children}
    <div className='absolute inset-x-0 bottom-0 h-px animate-pulse bg-gradient-to-r from-transparent via-comet/30 to-transparent' />
  </motion.section>
)

export default PanelWrapper
