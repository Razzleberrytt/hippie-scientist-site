import { useEffect, useMemo, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { getDailyDiscoverySnippet } from '@/utils/contentSnippets'

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
  const location = useLocation()
  const isHome = location.pathname === '/'
  const dailyDiscovery = useMemo(() => getDailyDiscoverySnippet(), [])
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

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
      <div className='border-white/8 border-t bg-white/[0.03]'>
        <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1.5 text-[11px] tracking-[0.08em] text-white/55 sm:px-6'>
          {dailyDiscovery && (
            <Link
              to={dailyDiscovery.ctaPath}
              className='text-emerald-100/80 hover:text-emerald-100'
            >
              Today&apos;s discovery: {dailyDiscovery.title}
            </Link>
          )}
          <span className='inline-flex items-center gap-1.5 whitespace-nowrap'>
            <span aria-hidden='true'>🧪</span>
            Research-based herbal knowledge
          </span>
          <span className='inline-flex items-center gap-1.5 whitespace-nowrap'>
            <span aria-hidden='true'>⚠️</span>
            Safety-first, harm-reduction approach
          </span>
          <span className='inline-flex items-center gap-1.5 whitespace-nowrap'>
            <span aria-hidden='true'>↻</span>
            Continuously updated database
          </span>
        </div>
      </div>
    </header>
  )
}
