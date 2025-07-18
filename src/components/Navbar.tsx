import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Atom, Download } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/learn', label: 'Learn' },
    { path: '/database', label: 'Database' },
    { path: '/research', label: 'Research' },
    { path: '/compounds', label: 'Explore Compounds' },
    { path: '/store', label: 'Store' },
    { path: '/downloads', label: 'Downloads', icon: Download },
  ]

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav className='fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur dark:bg-space-dark/70'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4'>
        <Link to='/' className='flex items-center space-x-2'>
          <Atom className='drop-shadow-glow h-8 w-8 text-lichen' aria-hidden='true' />
          <span className='text-gradient text-xl font-bold'>Hippie Scientist</span>
        </Link>

        <div className='flex items-center md:hidden'>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className='p-2'
            aria-label='Toggle navigation menu'
            aria-expanded={isOpen}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        <ul className='hidden items-center space-x-6 md:flex'>
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-shadow ${
                  isActive(path)
                    ? 'bg-cosmic-forest text-white shadow-glow'
                    : 'text-gray-700 hover:shadow-glow dark:text-sand'
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
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className='flex flex-col space-y-2 overflow-hidden bg-white/90 px-4 py-4 dark:bg-space-dark/90 md:hidden'
          >
            {navItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <Link
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-1 rounded-md px-4 py-2 text-base font-medium transition-shadow ${
                    isActive(path)
                      ? 'bg-cosmic-forest text-white shadow-glow'
                      : 'text-gray-700 hover:shadow-glow dark:text-sand'
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
