import { type ReactNode, useId, useState } from 'react'

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
        <span className='text-xs text-white/70'>{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div id={contentId} className='border-white/8 border-t px-4 py-3'>
          {children}
        </div>
      )}
    </section>
  )
}
