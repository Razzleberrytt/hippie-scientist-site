'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { SearchModal } from './SearchModal'
import { mainNavigation, NavigationItem } from '@/lib/navigation-config'

/**
 * Main Navigation Component
 *
 * Sticky header with:
 * - Logo/brand
 * - Desktop dropdown menus (Discover, Learn, Tools)
 * - Mobile hamburger menu
 * - Search button placeholder
 * - Dark mode support (respects site theme)
 *
 * Accessible:
 * - ARIA labels for buttons
 * - Keyboard navigation support
 * - Focus management
 * - Semantic HTML
 *
 * Styling:
 * - Emerald green theme (#10b981)
 * - Sticky positioning
 * - Glass morphism effect on mobile menu
 *
 * @component
 */
export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const toggleDropdown = (href: string) => {
    setOpenDropdown(openDropdown === href ? null : href)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
            <span className="hidden sm:inline">The Hippie Scientist</span>
            <span className="sm:hidden">THS</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {mainNavigation.map((item) => (
              <div key={item.href} className="relative group">
                <button
                  onClick={() => toggleDropdown(item.href)}
                  className={`flex items-center gap-1 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-emerald-600 dark:text-emerald-500'
                      : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500'
                  }`}
                  aria-expanded={openDropdown === item.href}
                  aria-haspopup={item.children ? 'true' : 'false'}
                >
                  <Link href={item.href}>{item.label}</Link>
                  {item.children && (
                    <svg
                      className="w-4 h-4 transition-transform group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  )}
                </button>

                {/* Dropdown Menu */}
                {item.children && (
                  <div className="absolute left-0 mt-0 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 border border-slate-200 dark:border-slate-700">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          isActive(child.href)
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 font-medium'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={child.description}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Pagefind Search Modal */}
            <SearchModal />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4"
          >
            {mainNavigation.map((item) => (
              <div key={item.href}>
                <button
                  onClick={() => toggleDropdown(item.href)}
                  className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between transition-colors ${
                    isActive(item.href)
                      ? 'text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  aria-expanded={openDropdown === item.href}
                >
                  <Link href={item.href} className="flex-1">
                    {item.label}
                  </Link>
                  {item.children && (
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === item.href ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  )}
                </button>

                {/* Mobile Dropdown */}
                {item.children && openDropdown === item.href && (
                  <div className="bg-slate-50 dark:bg-slate-800 py-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-8 py-2 text-sm transition-colors ${
                          isActive(child.href)
                            ? 'text-emerald-600 dark:text-emerald-500 font-medium'
                            : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
