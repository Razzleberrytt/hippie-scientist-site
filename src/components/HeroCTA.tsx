import { Link } from 'react-router-dom'

const baseButtonClasses =
  'flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:text-base'

export default function HeroCTA() {
  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 gap-3 sm:w-auto sm:max-w-xl sm:grid-cols-2'>
        <Link
          to='/build'
          className={`${baseButtonClasses} relative overflow-hidden bg-emerald-400 text-emerald-950 shadow-[0_8px_30px_rgba(16,185,129,.28)] hover:scale-[1.01] hover:bg-emerald-300 active:scale-[.99]`}
        >
          <span
            aria-hidden
            className='pointer-events-none absolute inset-0 bg-gradient-to-r from-white/25 via-transparent to-transparent opacity-70'
          />
          <span
            aria-hidden
            className='pointer-events-none absolute -inset-4 animate-pulse rounded-[inherit] bg-emerald-300/20 blur-xl'
          />
          <span className='relative'>🧪 Build a Blend</span>
        </Link>
        <Link
          to='/herbs'
          className={`${baseButtonClasses} border-white/22 text-white/88 border bg-white/[0.03] hover:border-white/35 hover:bg-white/[0.08] active:scale-[.99]`}
        >
          🌿 Browse Herbs
        </Link>
      </div>
    </div>
  )
}
