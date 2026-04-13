// UPDATED: Streamlined dark-mode primary nav to home, herbs, compounds, blog, and search toggle.
import { type FormEvent, useEffect, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

const linkBase =
  'inline-flex min-h-11 items-center justify-center rounded-xl px-3.5 text-sm font-medium transition-all duration-200'
const linkDim =
  'border border-transparent text-white/72 hover:border-white/15 hover:bg-white/8 hover:text-white'
const linkActive =
  'border border-emerald-400/40 bg-emerald-500/10 text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location])

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = searchQuery.trim()
    navigate(query ? `/herbs?q=${encodeURIComponent(query)}` : '/herbs')
    setMenuOpen(false)
    setSearchOpen(false)
  }

  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40'>
      <nav className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='flex items-center justify-between gap-2 py-2 sm:py-2.5'>
          <Link to='/' className='shrink-0 rounded-xl px-2 py-1.5 transition hover:text-white'>
            <span className='font-display text-lg italic tracking-tight text-white'>The Hippie Scientist</span>
          </Link>

          <div className='hidden items-center gap-1.5 md:flex'>
            <NavLink to='/herbs' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim}`}>
              Herbs
            </NavLink>
            <NavLink to='/compounds' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim}`}>
              Compounds
            </NavLink>
            <NavLink to='/blog' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim}`}>
              Blog
            </NavLink>
            <button
              type='button'
              aria-label='Toggle search'
              onClick={() => setSearchOpen(v => !v)}
              className='inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/15 bg-white/7 text-white/85 transition hover:border-white/30 hover:bg-white/12'
            >
              <Search size={16} />
            </button>
          </div>

          <button
            type='button'
            className='inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/15 bg-white/7 px-3 text-sm font-medium text-white/92 transition hover:border-lime-400/30 hover:bg-white/12 md:hidden'
            aria-label='Toggle navigation menu'
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className='pb-2'>
            <label htmlFor='site-search-desktop' className='sr-only'>
              Search herbs
            </label>
            <input
              id='site-search-desktop'
              type='search'
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder='Search herbs...'
              className='min-h-11 w-full rounded-xl border border-white/15 bg-white/7 px-3 text-sm text-white placeholder:text-white/45 focus:border-emerald-300/45 focus:outline-none'
            />
          </form>
        )}

        {menuOpen && (
          <div className='border-white/12 mb-2 grid gap-2 rounded-2xl border bg-black/40 p-2.5 backdrop-blur-xl md:hidden'>
            <button
              type='button'
              onClick={() => setSearchOpen(v => !v)}
              className={`${linkBase} ${linkDim} justify-start`}
            >
              <Search size={15} className='mr-2' />
              Search
            </button>
            <NavLink to='/herbs' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim} justify-start`}>
              Herbs
            </NavLink>
            <NavLink to='/compounds' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim} justify-start`}>
              Compounds
            </NavLink>
            <NavLink to='/blog' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkDim} justify-start`}>
              Blog
            </NavLink>
            {searchOpen && (
              <form onSubmit={handleSearchSubmit}>
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
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
