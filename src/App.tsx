import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './contexts/theme'
import Navbar from './components/Navbar'
import FloatingElements from './components/FloatingElements'
import MouseTrail from './components/MouseTrail'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Research = lazy(() => import('./pages/Research'))
const Database = lazy(() => import('./pages/Database'))
const Safety = lazy(() => import('./pages/Safety'))
const Community = lazy(() => import('./pages/Community'))
const NotFound = lazy(() => import('./pages/NotFound'))

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
}

const AnimatedRoutes: React.FC = () => {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/database" element={<Database />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/community" element={<Community />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-space-dark via-cosmic-purple to-space-dark">
              <FloatingElements />
              <MouseTrail />
              <Navbar />
              <main className="relative z-10">
                <Suspense fallback={<LoadingSpinner />}>
                  <AnimatedRoutes />
                </Suspense>
              </main>
            </div>
          </Router>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App
