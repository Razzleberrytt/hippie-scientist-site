import clsx from 'clsx'
import { motion } from 'framer-motion'

interface Props {
  label: string
  variant?: 'pink' | 'blue' | 'purple' | 'green' | 'yellow' | 'red'
  className?: string
}

const colorMap = {
  pink: 'from-pink-600 via-fuchsia-500 to-pink-600 shadow-pink-500/40',
  blue: 'from-sky-600 via-cyan-500 to-sky-600 shadow-cyan-500/40',
  purple: 'from-purple-700 via-violet-600 to-purple-700 shadow-violet-600/40',
  green: 'from-lime-600 via-emerald-500 to-lime-600 shadow-emerald-500/40',
  yellow: 'from-amber-600 via-yellow-500 to-amber-600 shadow-amber-500/40',
  red: 'from-rose-600 via-red-500 to-rose-600 shadow-red-500/40',
}

export default function TagBadge({ label, variant = 'purple', className }: Props) {
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={clsx(
        'inline-flex items-center rounded-full bg-gradient-to-br px-2 py-0.5 text-xs font-medium text-white shadow',
        colorMap[variant],
        className,
      )}
    >
      {label}
    </motion.span>
  )
}
