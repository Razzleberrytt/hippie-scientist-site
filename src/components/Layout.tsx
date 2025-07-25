import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className='flex min-h-screen flex-col bg-light-beige text-bark dark:bg-space-dark dark:text-sand'>
    <header className='sticky top-0 z-50 shadow'>
      <Navbar />
    </header>
    <main className='flex-1'>{children}</main>
    <Footer />
  </div>
)

export default Layout
