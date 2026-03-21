import { Link } from 'react-router-dom'

const baseButtonClasses =
  'flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:text-base'

export default function HeroCTA() {
  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 gap-3 sm:max-w-3xl sm:grid-cols-3'>
        <Link
          to='/herbs'
          className={`${baseButtonClasses} border border-emerald-200/35 bg-emerald-400 text-emerald-950 hover:-translate-y-0.5 hover:bg-emerald-300 active:translate-y-0 active:scale-[.99]`}
        >
          🌿 Explore Herbs
        </Link>
        <Link
          to='/compounds'
          className={`${baseButtonClasses} border border-white/25 bg-white/[0.04] text-white/90 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.1] active:translate-y-0 active:scale-[.99]`}
        >
          🧪 View Compounds
        </Link>
        <Link
          to='/build'
          className={`${baseButtonClasses} border border-white/20 bg-white/[0.03] text-white/80 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.08] hover:text-white active:translate-y-0 active:scale-[.99]`}
        >
          Build a Blend
        </Link>
      </div>
    </div>
  )
}
