import { type FormEvent, useEffect, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

const linkBase =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
const linkActive =
  'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)]'

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
    <header className='sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[color:rgb(11_18_32/92%)] backdrop-blur-md'>
      <nav className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='flex items-center justify-between gap-2 py-2 sm:py-2.5'>
          <Link to='/' className='shrink-0 rounded-xl px-2 py-1.5 text-[var(--text-primary)] transition-colors hover:text-[var(--accent-primary)]'>
            <span className='text-xl font-semibold tracking-tight'>🌿 The Hippie Scientist</span>
          </Link>

          <div className='hidden items-center gap-1.5 md:flex'>
            <NavLink to='/herbs' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              Herbs
            </NavLink>
            <NavLink to='/compounds' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              Compounds
            </NavLink>
            <NavLink to='/blog' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              Blog
            </NavLink>
            <button
              type='button'
              aria-label='Toggle search'
              onClick={() => setSearchOpen(v => !v)}
              className='inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-primary)]/45 hover:text-[var(--text-primary)]'
            >
              <Search size={16} />
            </button>
          </div>

          <button
            type='button'
            className='inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] px-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)] md:hidden'
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
              className='min-h-11 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]/55 focus:outline-none'
            />
          </form>
        )}

        {menuOpen && (
          <div className='mb-2 grid gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-2.5 md:hidden'>
            <button
              type='button'
              onClick={() => setSearchOpen(v => !v)}
              className={`${linkBase} justify-start`}
            >
              <Search size={15} className='mr-2' />
              Search
            </button>
            <NavLink to='/herbs' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} justify-start`}>
              Herbs
            </NavLink>
            <NavLink to='/compounds' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} justify-start`}>
              Compounds
            </NavLink>
            <NavLink to='/blog' className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} justify-start`}>
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
                  className='min-h-11 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]/55 focus:outline-none'
                />
              </form>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
