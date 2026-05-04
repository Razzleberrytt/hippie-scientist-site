'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { springConfig } from '@/utils/springConfig'

export default function Card({ title, description, href, bestFor }: any) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={springConfig.card}
        className="glass-card glass-card-hover p-5"
      >
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-white/70 mt-2">{description}</p>
        )}
        {bestFor && (
          <p className="text-xs text-white/60 mt-3">Best for: {bestFor}</p>
        )}
      </motion.div>
    </Link>
  )
}
