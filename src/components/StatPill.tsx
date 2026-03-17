import { Link } from 'react-router-dom'

type StatPillProps = {
  to: string
  value: number
  label: string
  testId?: string
}

export default function StatPill({ to, value, label, testId }: StatPillProps) {
  return (
    <Link
      data-testid={testId}
      to={to}
      className='hover:bg-white/8 group relative flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 active:scale-[.99] sm:gap-3 sm:px-4 sm:py-3'
      aria-label={`${value} ${label}`}
    >
      <span className='grid h-8 w-8 place-content-center rounded-full border border-white/15 bg-white/10 text-xs font-semibold text-white/90 sm:h-9 sm:w-9 sm:text-sm'>
        {value}
      </span>
      <span className='text-white/90'>{label}</span>
      <span
        aria-hidden
        className='ml-auto text-white/70 opacity-0 transition group-hover:opacity-100'
      >
        ↗
      </span>
    </Link>
  )
}
