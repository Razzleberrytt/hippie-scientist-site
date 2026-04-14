import { Link } from 'react-router-dom'

const baseButtonClasses =
  'btn w-full sm:w-auto text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60'

export default function HeroCTA() {
  return (
    <div className='w-full space-y-3'>
      <div className='flex flex-col gap-2 sm:flex-row'>
        <a href='#effect-search' className={`${baseButtonClasses} btn-primary`}>
          Start Effect Search
        </a>
        <Link to='/herbs' className={`${baseButtonClasses} btn-secondary`}>
          Browse Archive
        </Link>
      </div>
      <div className='flex flex-wrap gap-3 text-xs text-white/62'>
        <Link to='/interactions' className='transition hover:text-white'>
          Interaction Checker
        </Link>
        <span>•</span>
        <Link to='/build' className='transition hover:text-white'>
          Blend Builder
        </Link>
      </div>
    </div>
  )
}
