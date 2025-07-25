import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Atom, Download, Star, FlaskConical } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/learn', label: 'Learn' },
    { path: '/database', label: 'Database' },
    { path: '/blend', label: '🧪 Blend Builder', icon: FlaskConical },
    { path: '/research', label: 'Research' },
    { path: '/favorites', label: 'Favorites', icon: Star },
    { path: '/compounds', label: 'Explore Compounds' },
    { path: '/store', label: 'Store' },
    { path: '/downloads', label: 'Downloads', icon: Download },
  ]

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav
      className='fixed left-0 right-0 top-0 z-50 bg-light-beige/80 backdrop-blur dark:bg-space-gray/80'
      role='navigation'
      aria-label='Primary'
    >
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4'>
        <Link to='/' className='flex items-center space-x-2'>
          <Atom className='h-8 w-8 text-lichen drop-shadow-glow' aria-hidden='true' />
          <span className='text-gradient text-xl font-bold'>Hippie Scientist</span>
        </Link>

        <div className='flex items-center md:hidden'>
          <button
            id='mobile-menu-button'
            onClick={() => setIsOpen(!isOpen)}
            className='p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple'
            aria-label='Toggle navigation menu'
            aria-expanded={isOpen}
            aria-controls='primary-navigation'
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        <ul id='primary-navigation' className='hidden items-center space-x-6 md:flex'>
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple ${
                  isActive(path)
                    ? 'bg-cosmic-forest text-white shadow-glow'
                    : 'text-gray-800 hover:text-cosmic-purple dark:text-sand/80'
                }`}
              >
                {Icon && <Icon size={16} />}
                {label}
              </Link>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            id='primary-navigation'
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className='flex flex-col space-y-2 overflow-hidden bg-light-beige/90 px-4 py-4 dark:bg-space-gray/90 md:hidden'
          >
            {navItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <Link
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-1 rounded-md px-4 py-2 text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple ${
                    isActive(path)
                      ? 'bg-cosmic-forest text-white shadow-glow'
                      : 'text-gray-800 hover:text-cosmic-purple dark:text-sand/80'
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {label}
                </Link>
              </li>
            ))}
            <li className='flex justify-center'>
              <ThemeToggle />
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
