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
        <Link to='/interactions' className={`${baseButtonClasses} btn-secondary`}>
          Check Interactions
        </Link>
      </div>
    </div>
  )
}
