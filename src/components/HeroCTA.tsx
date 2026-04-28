import { Link } from '@/lib/router-compat'

const baseButtonClasses =
  'btn w-full sm:w-auto text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60'

export default function HeroCTA() {
  return (
    <div className='w-full space-y-3'>
      <div className='flex flex-col gap-2 sm:flex-row'>
        <Link to='/herbs' className={`${baseButtonClasses} btn-primary`}>
          Browse herbs
        </Link>
        <Link to='/compounds' className={`${baseButtonClasses} btn-secondary`}>
          Browse compounds
        </Link>
      </div>
      <div className='flex flex-wrap gap-3 text-xs text-white/62'>
        <a href='#mechanism-explorer' className='transition hover:text-white'>
          Mechanism explorer
        </a>
        <span>•</span>
        <Link to='/interactions' className='transition hover:text-white'>
          Interaction checker
        </Link>
      </div>
    </div>
  )
}
