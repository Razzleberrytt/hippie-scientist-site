import React from 'react'
import { motion } from 'framer-motion'
import { decodeTag } from '../utils/format'

interface Props {
  counts: Record<string, number>
  className?: string
}

export default function TagDistribution({ counts, className = '' }: Props) {
  const entries = React.useMemo(() => {
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [counts])

  const max = React.useMemo(() => {
    return Math.max(1, ...entries.map(([, c]) => c))
  }, [entries])

  const main = entries.filter(([, c]) => c > 1)
  const others = entries.filter(([, c]) => c <= 1)

  const Row = ({ tag, count }: { tag: string; count: number }) => (
    <div className='flex items-center gap-2'>
      <span className='overflow-hidden text-ellipsis whitespace-nowrap text-xs sm:text-sm'>
        {decodeTag(tag)}
      </span>
      <div className='flex-1'>
        <div className='relative h-[8px] overflow-hidden rounded-full bg-zinc-800/50'>
          <motion.div
            className='h-[8px] rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-fuchsia-500'
            initial={{ width: 0 }}
            whileInView={{ width: `${(count / max) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            role='progressbar'
            aria-label={`${decodeTag(tag)} count`}
            aria-valuenow={count}
            aria-valuemin={0}
            aria-valuemax={max}
          />
          <span className='absolute -top-1 right-1 text-[10px]'>{count}</span>
        </div>
      </div>
    </div>
  )

  const [open, setOpen] = React.useState(false)

  return (
    <div className={`grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 ${className}`}>
      {main.map(([tag, count]) => (
        <Row key={tag} tag={tag} count={count} />
      ))}
      {others.length > 0 && (
        <details className='col-span-full' onToggle={e => setOpen(e.currentTarget.open)}>
          <summary className='flex cursor-pointer items-center gap-1 text-xs sm:text-sm'>
            Other Tags
            <motion.span animate={{ rotate: open ? 90 : 0 }} className='inline-block'>
              ▶
            </motion.span>
          </summary>
          <div className='mt-2 grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2'>
            {others.map(([tag, count]) => (
              <Row key={tag} tag={tag} count={count} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
