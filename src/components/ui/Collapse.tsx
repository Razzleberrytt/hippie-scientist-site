import { type ReactNode, useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function Collapse({
  title,
  children,
  defaultOpen = false,
  onToggle,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  onToggle?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const contentId = useId()

  return (
    <section className='overflow-hidden rounded-2xl border border-white/10 bg-white/5'>
      <button
        type='button'
        onClick={() =>
          setOpen(v => {
            const next = !v
            onToggle?.(next)
            return next
          })
        }
        aria-expanded={open}
        aria-controls={contentId}
        className='flex w-full items-center justify-between gap-3 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10'
      >
        <span className='text-sm font-semibold uppercase tracking-[0.16em] text-white/75'>
          {title}
        </span>
        <span className='inline-flex items-center gap-2 text-xs text-white/70'>
          {open ? 'Hide' : 'Show'}
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key='collapse-content'
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className='overflow-hidden'
          >
            <div className='border-white/8 border-t px-4 py-3'>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
