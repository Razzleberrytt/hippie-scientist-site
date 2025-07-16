import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ParticlesBackground from './components/ParticlesBackground'
import { LoadingScreen } from './components/LoadingScreen'

const Home = lazy(() => import('./pages/Home'))
const BlogIndex = lazy(() => import('./pages/BlogIndex'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <div className='relative flex min-h-screen flex-col overflow-x-hidden bg-space-dark text-spore'>
      <ParticlesBackground />
      <Navbar />
      <motion.main className='flex-1 pt-16' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/blog' element={<BlogIndex />} />
            <Route path='/blog/:slug' element={<BlogPost />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.main>
      <Footer />
    </div>
  )
}
