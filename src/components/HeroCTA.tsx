import { Link } from 'react-router-dom'

const baseButtonClasses =
  'btn w-full sm:w-auto text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45'

export default function HeroCTA() {
  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-2'>
        <Link to='/herbs' className={`${baseButtonClasses} btn-primary`}>
          Browse Herbs
        </Link>
        <a href='#effect-search' className={`${baseButtonClasses} btn-secondary`}>
          Effect Search
        </a>
      </div>
      <div className='mt-3 flex flex-wrap gap-2'>
        <Link
          to='/interactions'
          className='text-xs text-white/75 underline-offset-4 hover:underline'
        >
          Interaction Checker
        </Link>
        <span className='text-white/40'>•</span>
        <Link to='/build' className='text-xs text-white/75 underline-offset-4 hover:underline'>
          Blend Builder
        </Link>
      </div>
    </div>
  )
}
