import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { LoadingScreen } from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ParticlesBackground from './components/ParticlesBackground'
const Home = React.lazy(() => import('./pages/Home'))
const BlogIndex = React.lazy(() => import('./pages/BlogIndex'))
const BlogPost = React.lazy(() => import('./pages/BlogPost'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <>
      <ParticlesBackground />
      <Navbar />
      <main className='pt-20'>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/blog' element={<BlogIndex />} />
            <Route path='/blog/:slug' element={<BlogPost />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

export default App
