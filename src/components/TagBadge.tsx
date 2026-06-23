import clsx from 'clsx'
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
    : (VARIANT_TO_CLASS_KEY[variant] ?? gradientKeyForTag(cleaned))
  const gradientClass = gradientClassName(gradientKey, 'blog')
  const content = (
    <span
      className={clsx(
        'inline-flex items-center whitespace-pre-wrap break-words rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/75 transition-all duration-200 motion-safe:hover:scale-105 active:scale-95',
        gradientClass,
        className
      )}
    >
      {cleaned}
    </span>
  )
  return alias ? <InfoTooltip text={`aka ${alias}`}>{content}</InfoTooltip> : content
}
