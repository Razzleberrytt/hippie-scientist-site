import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const linkBase = 'rounded-xl transition-all duration-200'
const linkDim = 'text-white/75 hover:text-white hover:bg-white/10'
const linkSolid =
  'bg-white/8 text-white/90 hover:scale-[1.01] hover:bg-white/14 active:scale-[0.98]'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40'>
      <nav className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='flex items-center justify-between py-2.5'>
          <Link
            to='/'
            className='shrink-0 text-base font-bold tracking-tight sm:text-lg md:text-xl'
            onClick={() => setMenuOpen(false)}
          >
            The Hippie Scientist
          </Link>

          <button
            type='button'
            className='inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-sm text-white/90 hover:bg-white/10 md:hidden'
            aria-label='Toggle navigation menu'
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            Menu
          </button>

          <div className='hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex'>
            <NavLink to='/herbs' className={`${linkBase} ${linkSolid} px-3 py-1.5 text-sm`}>
              Browse Herbs
            </NavLink>
            <NavLink to='/blend' className={`${linkBase} ${linkSolid} px-3 py-1.5 text-sm`}>
              Build a Blend
            </NavLink>
            <NavLink to='/compounds' className={`${linkBase} ${linkDim} px-3 py-1.5 text-sm`}>
              Compounds
            </NavLink>
            <NavLink to='/blog' className={`${linkBase} ${linkDim} px-3 py-1.5 text-sm`}>
              Blog
            </NavLink>
            <NavLink to='/about' className={`${linkBase} ${linkDim} px-3 py-1.5 text-sm`}>
              About
            </NavLink>
          </div>
        </div>
        {menuOpen && (
          <div className='grid gap-1.5 pb-2 md:hidden'>
            <NavLink
              to='/herbs'
              className={`${linkBase} ${linkSolid} min-h-11 px-3 py-2 text-sm`}
              onClick={() => setMenuOpen(false)}
            >
              Browse Herbs
            </NavLink>
            <NavLink
              to='/blend'
              className={`${linkBase} ${linkSolid} min-h-11 px-3 py-2 text-sm`}
              onClick={() => setMenuOpen(false)}
            >
              Build a Blend
            </NavLink>
            <NavLink
              to='/compounds'
              className={`${linkBase} ${linkDim} min-h-11 px-3 py-2 text-sm`}
              onClick={() => setMenuOpen(false)}
            >
              Compounds
            </NavLink>
            <NavLink
              to='/blog'
              className={`${linkBase} ${linkDim} min-h-11 px-3 py-2 text-sm`}
              onClick={() => setMenuOpen(false)}
            >
              Blog
            </NavLink>
            <NavLink
              to='/about'
              className={`${linkBase} ${linkDim} min-h-11 px-3 py-2 text-sm`}
              onClick={() => setMenuOpen(false)}
            >
              About
            </NavLink>
          </div>
        )}
      </nav>
    </header>
  )
}
