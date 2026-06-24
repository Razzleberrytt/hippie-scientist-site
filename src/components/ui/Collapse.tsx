import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
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
  const [contentHeight, setContentHeight] = useState<number | 'auto'>(defaultOpen ? 'auto' : 0)
  const contentId = useId()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return
    setContentHeight(open ? contentRef.current.scrollHeight : 0)
  }, [open, children])

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
      <div
        id={contentId}
        aria-hidden={!open}
        className='overflow-hidden transition-all duration-[220ms] ease-in-out'
        style={{ height: contentHeight, opacity: open ? 1 : 0 }}
      >
        <div ref={contentRef}>
          <div className='border-white/10 border-t px-4 py-3'>{children}</div>
        </div>
      </div>
    </section>
  )
}
