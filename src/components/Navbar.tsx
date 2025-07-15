
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Atom } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [{ path: '/', label: 'Home' }];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card m-4 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Atom className="h-8 w-8 text-psychedelic-purple" aria-hidden="true" />
            <span className="text-xl font-bold psychedelic-text">Hippie Scientist</span>
          </Link>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>

          <div className="hidden md:flex space-x-4">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(path) ? 'bg-psychedelic-purple text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="md:hidden flex flex-col space-y-2 mt-4 px-2 pb-4"
          >
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-md text-base font-medium ${
                  isActive(path) ? 'bg-psychedelic-purple text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
