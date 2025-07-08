import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Research from './pages/Research'
import Database from './pages/Database'
import Safety from './pages/Safety'
import Community from './pages/Community'
import FloatingElements from './components/effects/FloatingElements'
import './index.css'

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen relative overflow-hidden">
        <FloatingElements />
        <Navbar />
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/research" element={<Research />} />
            <Route path="/database" element={<Database />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </AnimatePresence>
        
        {/* Scroll to top button */}
        <motion.button
          className="fixed bottom-8 right-8 glass-button p-3 rounded-full glow-subtle"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      </div>
    </Router>
  )
}

export default App