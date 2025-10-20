import { Link, NavLink } from 'react-router-dom'

const linkBase = 'px-3 py-1.5 rounded-xl transition-colors'
const linkDim = 'text-white/80 hover:text-white hover:bg-white/10'
const linkSolid = 'bg-white/10 hover:bg-white/20 text-white'

export default function NavBar() {
  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40'>
      <nav className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='flex h-14 items-center justify-between'>
          <Link to='/' className='text-xl font-bold tracking-tight'>
            The Hippie Scientist
          </Link>
          <div className='flex flex-wrap items-center gap-2'>
            <NavLink to='/herbs' className={`${linkBase} ${linkSolid}`}>
              Browse Herbs
            </NavLink>
            <NavLink to='/blend' className={`${linkBase} ${linkSolid}`}>
              Build a Blend
            </NavLink>
            <NavLink to='/compounds' className={`${linkBase} ${linkDim}`}>
              Compounds
            </NavLink>
            <NavLink to='/blog' className={`${linkBase} ${linkDim}`}>
              Blog
            </NavLink>
            <NavLink to='/about' className={`${linkBase} ${linkDim}`}>
              About
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  )
}
