import { Link } from 'react-router-dom'

const baseButtonClasses =
  'flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:text-base'

export default function HeroCTA() {
  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-2'>
        <Link
          to='/build'
          className={`${baseButtonClasses} relative overflow-hidden border border-emerald-200/35 bg-emerald-400 text-emerald-950 shadow-[0_10px_34px_rgba(16,185,129,.35)] hover:-translate-y-0.5 hover:bg-emerald-300 active:translate-y-0 active:scale-[.99]`}
        >
          <span
            aria-hidden
            className='pointer-events-none absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent opacity-80'
          />
          <span className='relative'>🧪 Build a Blend</span>
        </Link>
        <Link
          to='/herbs'
          className={`${baseButtonClasses} border border-white/25 bg-white/[0.04] text-white/90 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.1] active:translate-y-0 active:scale-[.99]`}
        >
          🌿 Browse Herbs
        </Link>
      </div>
    </div>
  )
}
