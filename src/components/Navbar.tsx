import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Atom } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/blog', label: 'Blog' },
    { path: '/learn', label: 'Learn' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className='fixed left-0 right-0 top-0 z-50 bg-midnight-blue/50 backdrop-blur-md'>
      <div className='mx-auto flex h-16 items-center justify-between px-6'>
        <Link to='/' className='flex items-center space-x-2'>
          <Atom className='drop-shadow-glow h-8 w-8 text-lichen' aria-hidden='true' />
          <span className='text-gradient text-xl font-bold'>Hippie Scientist</span>
        </Link>

        <div className='flex items-center space-x-2 md:hidden'>
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className='p-2'
            aria-label='Toggle navigation menu'
            aria-expanded={isOpen}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        <div className='hidden items-center space-x-4 md:flex'>
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-shadow ${
                isActive(path)
                  ? 'bg-cosmic-forest text-white shadow-glow'
                  : 'text-gray-300 hover:shadow-glow'
              }`}
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className='mt-4 flex flex-col space-y-2 px-2 pb-4 md:hidden'
          >
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`block rounded-md px-4 py-2 text-base font-medium transition-shadow ${
                  isActive(path)
                    ? 'bg-cosmic-forest text-white shadow-glow'
                    : 'text-gray-300 hover:shadow-glow'
                }`}
              >
                {label}
              </Link>
            ))}
            <ThemeToggle />
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
