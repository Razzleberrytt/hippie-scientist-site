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
      className='border-white/12 hover:border-white/24 group relative flex items-center gap-3 rounded-2xl border bg-white/[0.035] px-4 py-3 text-sm text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 active:translate-y-0 active:scale-[.99]'
      aria-label={`${value} ${label}`}
    >
      <span className='grid h-10 w-10 place-content-center rounded-xl border border-white/20 bg-white/10 text-base font-bold tabular-nums text-white sm:text-lg'>
        {value}
      </span>
      <span className='text-white/82 leading-tight'>{label}</span>
      <span aria-hidden className='ml-auto text-white/55 transition group-hover:text-white/80'>
        ↗
      </span>
    </Link>
  )
}
