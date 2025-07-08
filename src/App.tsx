import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './contexts/theme'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Research from './pages/Research'
import Database from './pages/Database'
import Safety from './pages/Safety'
import Community from './pages/Community'
import FloatingElements from './components/FloatingElements'
import './index.css'

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

const AnimatedRoutes: React.FC = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Home />
          </motion.div>
        } />
        <Route path="/research" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Research />
          </motion.div>
        } />
        <Route path="/database" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Database />
          </motion.div>
        } />
        <Route path="/safety" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Safety />
          </motion.div>
        } />
        <Route path="/community" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Community />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen relative overflow-hidden">
          <FloatingElements />
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
  )
}

export default App
