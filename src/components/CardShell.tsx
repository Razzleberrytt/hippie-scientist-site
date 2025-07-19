import React from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
}

const CardShell: React.FC<Props> = ({ children, className }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`glass-card hover-glow relative rounded-lg bg-gradient-to-br from-white/5 to-white/10 p-4 focus-within:shadow-glow ${className ?? ''}`}
  >
    {children}
  </motion.div>
)

export default CardShell
