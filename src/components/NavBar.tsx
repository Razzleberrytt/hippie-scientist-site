import { Link, NavLink } from 'react-router-dom'

const linkBase = 'px-3 py-1.5 rounded-xl transition-colors'
const linkDim = 'text-white/80 hover:text-white hover:bg-white/10'
const linkSolid = 'bg-white/10 hover:bg-white/20 text-white'

export default function NavBar() {
  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40'>
      <nav className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='flex flex-wrap items-center gap-x-4 gap-y-2 py-2 md:flex-nowrap md:justify-between'>
          <Link
            to='/'
            className='shrink-0 text-base font-bold tracking-tight sm:text-lg md:text-xl'
          >
            The Hippie Scientist
          </Link>
          <div className='flex min-w-0 flex-1 flex-wrap items-center justify-start gap-1.5 sm:gap-2 md:justify-end'>
            <NavLink to='/herbs' className={`${linkBase} ${linkSolid} text-xs sm:text-sm`}>
              Browse Herbs
            </NavLink>
            <NavLink to='/blend' className={`${linkBase} ${linkSolid} text-xs sm:text-sm`}>
              Build a Blend
            </NavLink>
            <NavLink to='/compounds' className={`${linkBase} ${linkDim} text-xs sm:text-sm`}>
              Compounds
            </NavLink>
            <NavLink to='/blog' className={`${linkBase} ${linkDim} text-xs sm:text-sm`}>
              Blog
            </NavLink>
            <NavLink to='/about' className={`${linkBase} ${linkDim} text-xs sm:text-sm`}>
              About
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  )
}
