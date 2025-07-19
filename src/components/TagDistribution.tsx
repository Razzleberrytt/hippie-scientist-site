import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import CountUp from 'react-countup'
import { decodeTag } from '../utils/format'
import { canonicalTag } from '../utils/tagUtils'
import ScrollToTopButton from './ScrollToTopButton'

interface Props {
  counts: Record<string, number>
  className?: string
  selected?: string[]
  onToggle?: (tag: string) => void
}

const GROUP_DEFS = [
  {
    label: 'Stimulant',
    tags: ['stimulant', 'energy', 'energizing', 'euphoriant', 'nootropic'],
    color: 'from-orange-400 to-amber-500',
  },
  {
    label: 'Psychedelic',
    tags: ['psychedelic', 'visionary', 'hallucinogenic', 'dissociative', 'entheogen'],
    color: 'from-fuchsia-500 to-pink-600',
  },
  {
    label: 'Sedative',
    tags: ['sedative', 'relaxant', 'calming', 'sleep', 'dream'],
    color: 'from-sky-500 to-blue-600',
  },
]

export default function TagDistribution({
  counts,
  className = '',
  selected = [],
  onToggle,
}: Props) {
  const entries = React.useMemo(() => {
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [counts])

  const groups = React.useMemo(() => {
    const map: Record<string, { tags: string[]; count: number; color: string }> = {}
    entries.forEach(([tag, c]) => {
      const canon = canonicalTag(tag)
      const def = GROUP_DEFS.find(d => d.tags.includes(canon))
      const key = def?.label || 'Other'
      if (!map[key]) {
        map[key] = { tags: [], count: 0, color: def?.color || 'from-emerald-400 to-lime-500' }
      }
      map[key].tags.push(tag)
      map[key].count += c
    })
    return Object.entries(map)
      .map(([label, data]) => ({ label, ...data }))
      .sort((a, b) => b.count - a.count)
  }, [entries])

  const max = React.useMemo(() => Math.max(1, ...groups.map(g => g.count)), [groups])
  const [showAll, setShowAll] = React.useState(false)
  const [mode, setMode] = React.useState<'grouped' | 'raw'>('grouped')

  const selectedSet = React.useMemo(() => new Set(selected.map(canonicalTag)), [selected])

  const Row = ({ tag, count, color }: { tag: string; count: number; color: string }) => {
    const active = selectedSet.has(canonicalTag(tag))
    return (
      <motion.button
        type='button'
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onToggle?.(canonicalTag(tag))}
        aria-pressed={active}
        className={clsx(
          'flex w-full items-center gap-2 rounded focus:outline-none',
          active ? 'hover-glow ring-1 ring-emerald-400' : 'opacity-80 hover:opacity-100'
        )}
      >
        <span className='overflow-hidden text-ellipsis whitespace-nowrap text-xs sm:text-sm'>
          {decodeTag(tag)}
        </span>
        <div className='flex-1'>
          <div className='relative h-[8px] overflow-hidden rounded-full bg-zinc-800/50'>
            <motion.div
              className={clsx('h-[8px] rounded-full bg-gradient-to-r', color)}
              initial={{ width: 0 }}
              whileInView={{ width: `${(count / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 80 }}
              role='progressbar'
              aria-label={`${decodeTag(tag)} count`}
              aria-valuenow={count}
              aria-valuemin={0}
              aria-valuemax={max}
            />
            <span className='absolute -top-1 right-1 text-[10px]'>
              <CountUp end={count} duration={0.6} enableScrollSpy={true} />
            </span>
          </div>
        </div>
      </motion.button>
    )
  }

  const GroupRow = ({
    label,
    tags,
    count,
    color,
  }: {
    label: string
    tags: string[]
    count: number
    color: string
  }) => {
    const [open, setOpen] = React.useState(false)
    return (
      <details className='col-span-full' onToggle={e => setOpen(e.currentTarget.open)}>
        <summary className='flex cursor-pointer items-center gap-2 text-xs sm:text-sm'>
          <span className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap'>{label}</span>
          <div className='flex-1'>
            <div className='relative h-[10px] overflow-hidden rounded-full bg-zinc-800/50'>
              <motion.div
                className={clsx('h-[10px] rounded-full bg-gradient-to-r', color)}
                initial={{ width: 0 }}
                whileInView={{ width: `${(count / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 80 }}
              />
              <span className='absolute -top-1 right-1 text-[10px]'>
                <CountUp end={count} duration={0.6} enableScrollSpy={true} />
              </span>
            </div>
          </div>
          <motion.span animate={{ rotate: open ? 90 : 0 }} className='inline-block'>
            ▶
          </motion.span>
        </summary>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className='mt-2 grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2'
        >
          {tags.map(t => (
            <Row key={t} tag={t} count={counts[t]} color={color} />
          ))}
        </motion.div>
      </details>
    )
  }

  const RawList = () => (
    <div className='grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2'>
      {entries.map(([tag, count]) => (
        <Row
          key={tag}
          tag={tag}
          count={count}
          color='from-purple-400 via-pink-500 to-fuchsia-500'
        />
      ))}
    </div>
  )

  const displayGroups = showAll ? groups : groups.slice(0, 12)

  return (
    <div className={`space-y-2 ${className}`}>
      <div className='text-right'>
        <button
          type='button'
          className='tag-pill'
          onClick={() => setMode(m => (m === 'grouped' ? 'raw' : 'grouped'))}
        >
          {mode === 'grouped' ? 'Raw Tags' : 'Categories'}
        </button>
      </div>
      {mode === 'grouped' ? (
        <>
          <div className='grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2'>
            {displayGroups.map(g => (
              <GroupRow
                key={g.label}
                label={g.label}
                tags={g.tags}
                count={g.count}
                color={g.color}
              />
            ))}
          </div>
          {groups.length > 12 && (
            <button
              type='button'
              className='tag-pill mx-auto block'
              onClick={() => setShowAll(s => !s)}
            >
              {showAll ? 'Show Less' : 'Show More'}
            </button>
          )}
        </>
      ) : (
        <RawList />
      )}
      {groups.length > 10 && <ScrollToTopButton />}
    </div>
  )
}
