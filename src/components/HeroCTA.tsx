import { Link } from 'react-router-dom'

const baseButtonClasses =
  'btn w-full sm:w-auto text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45'

export default function HeroCTA() {
  return (
    <div className='w-full space-y-5 sm:space-y-7'>
      <div className='pt-3 sm:pt-4'>
        <a href='#effect-search' className={`${baseButtonClasses} btn-primary`}>
          Start with Effect Search
        </a>
      </div>
      <div className='flex flex-wrap gap-2.5'>
        <Link
          to='/interactions'
          className='text-xs text-white/45 underline-offset-4 transition hover:text-white/65 hover:underline'
        >
          Interaction Checker
        </Link>
        <span className='text-white/40'>•</span>
        <Link
          to='/build'
          className='text-xs text-white/45 underline-offset-4 transition hover:text-white/65 hover:underline'
        >
          Blend Builder
        </Link>
      </div>
    </div>
  )
}
