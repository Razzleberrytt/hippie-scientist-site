import { Link } from 'react-router-dom'

const baseButtonClasses =
  'btn w-full sm:w-auto text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45'

export default function HeroCTA() {
  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 gap-3 sm:max-w-3xl sm:grid-cols-3'>
        <Link to='/herbs' className={`${baseButtonClasses} btn-primary`}>
          Explore Herbs
        </Link>
        <Link to='/compounds' className={`${baseButtonClasses} btn-secondary`}>
          View Compounds
        </Link>
        <Link to='/build' className={`${baseButtonClasses} btn-ghost`}>
          Build a Blend
        </Link>
      </div>
    </div>
  )
}
