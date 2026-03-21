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
      className='border-white/8 text-white/88 hover:border-white/18 group relative flex items-center gap-3 rounded-2xl border bg-white/[0.035] px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 active:translate-y-0 active:scale-[.99]'
      aria-label={`${value} ${label}`}
    >
      <span className='grid h-9 w-9 place-content-center rounded-full border border-white/20 bg-white/10 text-base font-semibold text-white sm:h-10 sm:w-10 sm:text-lg'>
        {value}
      </span>
      <span className='text-white/85'>{label}</span>
      <span
        aria-hidden
        className='ml-auto text-white/65 opacity-0 transition group-hover:opacity-100'
      >
        ↗
      </span>
    </Link>
  )
}
