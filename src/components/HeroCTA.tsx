import { Link } from 'react-router-dom'

const baseButtonClasses =
  'btn w-full sm:w-auto text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50'

export default function HeroCTA() {
  return (
    <div className='w-full space-y-3'>
      <div>
        <a href='#effect-search' className={`${baseButtonClasses} btn-primary`}>
          Start with Effect Search
        </a>
      </div>
      <div className='flex flex-wrap gap-2 text-xs text-white/58'>
        <Link to='/interactions' className='underline-offset-4 transition hover:text-white/80 hover:underline'>
          Interaction Checker
        </Link>
        <span>•</span>
        <Link to='/build' className='underline-offset-4 transition hover:text-white/80 hover:underline'>
          Blend Builder
        </Link>
      </div>
    </div>
  )
}
