import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
  type: "tween",
  ease: "anticipate",
  duration: 0.5
}

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading page..." />
        </div>
      }>
        {children}
      </Suspense>
    </ErrorBoundary>
  </motion.div>
)

const AnimatedRoutes: React.FC = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageWrapper>
            <Home />
          </PageWrapper>
        } />
        <Route path="/research" element={
          <PageWrapper>
            <Research />
          </PageWrapper>
        } />
        <Route path="/database" element={
          <PageWrapper>
            <Database />
          </PageWrapper>
        } />
        <Route path="/safety" element={
          <PageWrapper>
            <Safety />
          </PageWrapper>
        } />
        <Route path="/community" element={
          <PageWrapper>
            <Community />
          </PageWrapper>
        } />
      </Routes>
    </AnimatePresence>
  )
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen relative overflow-hidden">
            <FloatingElements />
            <MouseTrail />
            <Navbar />
            
            <main className="relative z-10">
              <AnimatedRoutes />
            </main>
            
            {/* Enhanced Scroll to Top Button */}
            <motion.button
              className="fixed bottom-8 right-8 glass-button p-3 rounded-full glow-subtle z-40 group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ scale: 1.1, rotate: 360 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
              aria-label="Scroll to top"
            >
              <svg 
                className="w-5 h-5 group-hover:text-psychedelic-purple transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </motion.button>
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
