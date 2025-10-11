import clsx from 'clsx'
import { motion } from 'framer-motion'
import InfoTooltip from './InfoTooltip'
import { tagAliasMap } from '../utils/tagUtils'
import {
  gradientClassName,
  gradientKeyForTag,
  resolveClassKey,
  type ClassMapKey,
} from '../lib/classMap'

interface Props {
  label: string
  variant?: 'pink' | 'blue' | 'purple' | 'green' | 'yellow' | 'red'
  toneKey?: string
  className?: string
}

const VARIANT_TO_CLASS_KEY: Record<NonNullable<Props['variant']>, ClassMapKey> = {
  pink: 'stimulant',
  blue: 'sedative',
  purple: 'psychoactive',
  green: 'adaptogen',
  yellow: 'adaptogen',
  red: 'psychoactive',
}

export default function TagBadge({ label, variant = 'purple', toneKey, className }: Props) {
  const cleaned = label.replace(/☠️/g, '').trim()
  const alias = tagAliasMap[cleaned.toLowerCase()]
  const gradientKey = toneKey
    ? resolveClassKey(toneKey, 'blog')
    : VARIANT_TO_CLASS_KEY[variant] ?? gradientKeyForTag(cleaned)
  const gradientClass = gradientClassName(gradientKey, 'blog')
  const content = (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      tabIndex={0}
      className={clsx(
        'hover-glow soft-border-glow text-shadow inline-flex items-center whitespace-pre-wrap break-words rounded-full px-2 py-1 text-xs font-medium shadow ring-1 ring-white/30 backdrop-blur-sm transition-colors duration-300 text-white',
        gradientClass,
        className
      )}
    >
      {cleaned}
    </motion.span>
  )
  return alias ? <InfoTooltip text={`aka ${alias}`}>{content}</InfoTooltip> : content
}
