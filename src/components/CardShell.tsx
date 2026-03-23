import React from 'react'
import { motion } from '@/lib/motion'

interface Props {
  children: React.ReactNode
  className?: string
}

const CardShell: React.FC<Props> = ({ children, className }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`glass-card hover-glow focus-within:shadow-glow relative rounded-lg bg-gradient-to-br from-white/5 to-white/10 p-4 ${className ?? ''}`}
  >
    {children}
  </motion.div>
)

export default CardShell
