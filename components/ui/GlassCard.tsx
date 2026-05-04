'use client'
import { motion } from 'framer-motion'
import { springConfig } from '@/utils/springConfig'

export function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={springConfig.card}
      className={`glass-card glass-card-hover relative overflow-hidden ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_2.5s_linear_infinite]" />
      </div>
      {children}
    </motion.div>
  )
}
