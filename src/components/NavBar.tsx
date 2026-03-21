import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const linkBase =
  'inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-all duration-200'
const linkDim =
  'border border-transparent text-white/72 hover:border-white/15 hover:bg-white/8 hover:text-white'
const linkSolid =
  'border border-white/15 bg-white/7 text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-brand-lime/35 hover:bg-white/14'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-black/65 backdrop-blur-xl supports-[backdrop-filter]:bg-black/45'>
      <nav className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='flex items-center justify-between gap-3 py-2.5 sm:py-3'>
          <Link
            to='/'
            className='shrink-0 rounded-xl px-1.5 py-1 text-base font-semibold tracking-tight text-white/95 transition hover:text-white sm:text-lg'
            onClick={() => setMenuOpen(false)}
          >
            The Hippie Scientist
          </Link>

          <button
            type='button'
            className='bg-white/8 text-white/92 hover:border-brand-lime/30 hover:bg-white/12 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/15 px-4 text-sm font-medium transition md:hidden'
            aria-label='Toggle navigation menu'
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>

          <div className='hidden min-w-0 flex-1 items-center justify-end gap-1.5 md:flex'>
            <NavLink to='/herbs' className={`${linkBase} ${linkSolid}`}>
              Browse Herbs
            </NavLink>
            <NavLink to='/blend' className={`${linkBase} ${linkSolid}`}>
              Build a Blend
            </NavLink>
            <NavLink to='/downloads' className={`${linkBase} ${linkSolid}`}>
              My Guides
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
        {menuOpen && (
          <div className='mb-2 grid gap-2 rounded-2xl border border-white/10 bg-black/35 p-2.5 backdrop-blur md:hidden'>
            <NavLink
              to='/herbs'
              className={`${linkBase} ${linkSolid} justify-start`}
              onClick={() => setMenuOpen(false)}
            >
              Browse Herbs
            </NavLink>
            <NavLink
              to='/blend'
              className={`${linkBase} ${linkSolid} justify-start`}
              onClick={() => setMenuOpen(false)}
            >
              Build a Blend
            </NavLink>
            <NavLink
              to='/downloads'
              className={`${linkBase} ${linkSolid} justify-start`}
              onClick={() => setMenuOpen(false)}
            >
              My Guides
            </NavLink>
            <NavLink
              to='/compounds'
              className={`${linkBase} ${linkDim} justify-start`}
              onClick={() => setMenuOpen(false)}
            >
              Compounds
            </NavLink>
            <NavLink
              to='/blog'
              className={`${linkBase} ${linkDim} justify-start`}
              onClick={() => setMenuOpen(false)}
            >
              Blog
            </NavLink>
            <NavLink
              to='/about'
              className={`${linkBase} ${linkDim} justify-start`}
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
