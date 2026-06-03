import { Link } from '@/lib/router-compat'

type StatPillProps = {
  to: string
  value: number
  label: string
  testId?: string
  onClick?: () => void
}

export default function StatPill({ to, value, label, testId, onClick }: StatPillProps) {
  return (
    <Link
      data-testid={testId}
      to={to}
      onClick={onClick}
      className='border-white/12 hover:border-white/24 group relative flex items-center gap-3 rounded-2xl border bg-white/[0.035] px-4 py-3 text-sm text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:shadow-[0_0_20px_-8px_hsl(38_92%_58%/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 active:translate-y-0 active:scale-[.99]'
      aria-label={`${value} ${label}`}
    >
      <span className='grid h-10 w-10 place-content-center rounded-xl border border-amber-300/25 bg-amber-500/10 sm:text-lg'>
        <span className='font-mono text-2xl font-medium tabular-nums text-amber-300'>{value}+</span>
      </span>
      <span className='text-white/82 leading-tight'>{label}</span>
      <span aria-hidden className='ml-auto text-white/55 transition group-hover:text-white/80'>
        ↗
      </span>
    </Link>
  )
}
