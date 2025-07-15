import React from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
}

const CardShell: React.FC<Props> = ({ children, className }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`glass-card relative rounded-lg p-4 hover:shadow-glow hover:ring-2 hover:ring-lichen/50 ${className ?? ''}`}
  >
    {children}
  </motion.div>
)

export default CardShell
