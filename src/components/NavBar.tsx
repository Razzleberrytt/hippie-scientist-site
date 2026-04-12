import { type FormEvent, useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

const linkBase =
  'inline-flex min-h-11 items-center justify-center rounded-xl px-3.5 text-sm font-medium transition-all duration-200'
const linkDim =
  'border border-transparent text-white/72 hover:border-white/15 hover:bg-white/8 hover:text-white'
const linkSolid =
  'border border-white/15 bg-white/7 text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-lime-400/35 hover:bg-white/14'
const linkActive =
  'border border-emerald-400/40 bg-emerald-500/10 text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = searchQuery.trim()
    navigate(query ? `/herbs?q=${encodeURIComponent(query)}` : '/herbs')
    setMenuOpen(false)
  }

  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40'>
      <nav className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='flex items-center justify-between gap-2 py-2 sm:py-2.5'>
          <Link
            to='/'
            className={`shrink-0 rounded-xl px-2 py-1.5 font-semibold tracking-tight transition hover:text-white ${isHome ? 'text-sm text-white/70 sm:text-base' : 'text-base text-white/95 sm:text-lg'}`}
            onClick={() => setMenuOpen(false)}
          >
            Hippie Scientist
          </Link>

          <button
            type='button'
            className='bg-white/7 text-white/92 hover:bg-white/12 inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/15 px-3 text-sm font-medium transition hover:border-lime-400/30 md:hidden'
            aria-label='Toggle navigation menu'
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className='hidden min-w-0 flex-1 items-center justify-end gap-1.5 md:flex'>
            {/* Sticky quick search keeps discovery accessible while reading long detail pages. */}
            <form onSubmit={handleSearchSubmit} className='mr-1 hidden lg:block'>
              <label htmlFor='site-search-desktop' className='sr-only'>
                Search herbs
              </label>
              <input
                id='site-search-desktop'
                type='search'
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder='Search herbs...'
                className='min-h-11 w-44 rounded-xl border border-white/15 bg-white/7 px-3 text-sm text-white placeholder:text-white/45 focus:border-emerald-300/45 focus:outline-none'
              />
            </form>
            <NavLink
              to='/herbs'
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkSolid}`}
            >
              Herbs
            </NavLink>
            <NavLink
              to='/compounds'
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim}`}
            >
              Compounds
            </NavLink>
            <NavLink
              to='/blog'
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim}`}
            >
              Blog
            </NavLink>
            <NavLink
              to='/learning'
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim}`}
            >
              Learning Paths
            </NavLink>
            <NavLink
              to='/interactions'
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkSolid}`}
            >
              Interaction Checker
            </NavLink>
            <NavLink
              to='/favorites'
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim}`}
            >
              Saved
            </NavLink>
            <NavLink
              to='/blend'
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkSolid}`}
            >
              Build a Blend
            </NavLink>
            <NavLink
              to='/about'
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim}`}
            >
              About
            </NavLink>
          </div>
        </div>
        {menuOpen && (
          <div className='border-white/12 mb-2 grid gap-2 rounded-2xl border bg-black/40 p-2.5 backdrop-blur-xl md:hidden'>
            {/* Mobile-first: keep search in the hamburger panel so it remains one tap away. */}
            <form onSubmit={handleSearchSubmit} className='mb-1'>
              <label htmlFor='site-search-mobile' className='sr-only'>
                Search herbs
              </label>
              <input
                id='site-search-mobile'
                type='search'
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder='Search herbs...'
                className='min-h-11 w-full rounded-xl border border-white/15 bg-white/7 px-3 text-sm text-white placeholder:text-white/45 focus:border-emerald-300/45 focus:outline-none'
              />
            </form>
            <NavLink
              to='/herbs'
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkSolid} justify-start`
              }
              onClick={() => setMenuOpen(false)}
            >
              Herbs
            </NavLink>
            <NavLink
              to='/compounds'
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkDim} justify-start`
              }
              onClick={() => setMenuOpen(false)}
            >
              Compounds
            </NavLink>
            <NavLink
              to='/blog'
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkDim} justify-start`
              }
              onClick={() => setMenuOpen(false)}
            >
              Blog
            </NavLink>
            <NavLink
              to='/learning'
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkDim} justify-start`
              }
              onClick={() => setMenuOpen(false)}
            >
              Learning Paths
            </NavLink>
            <NavLink
              to='/interactions'
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkSolid} justify-start`
              }
              onClick={() => setMenuOpen(false)}
            >
              Interaction Checker
            </NavLink>
            <NavLink
              to='/favorites'
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkDim} justify-start`
              }
              onClick={() => setMenuOpen(false)}
            >
              Saved
            </NavLink>
            <NavLink
              to='/blend'
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkSolid} justify-start`
              }
              onClick={() => setMenuOpen(false)}
            >
              Build a Blend
            </NavLink>
            <NavLink
              to='/about'
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkDim} justify-start`
              }
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
