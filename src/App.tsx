import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { LoadingScreen } from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MouseTrail from './components/MouseTrail'
import ScrollToTopButton from './components/ScrollToTopButton'
const Home = React.lazy(() => import('./pages/Home'))
const BlogIndex = React.lazy(() => import('./pages/BlogIndex'))
const BlogPost = React.lazy(() => import('./pages/BlogPost'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const Learn = React.lazy(() => import('./pages/Learn'))
const Lesson = React.lazy(() => import('./pages/Lesson'))
const About = React.lazy(() => import('./pages/About'))
const Store = React.lazy(() => import('./pages/Store'))
const Research = React.lazy(() => import('./pages/Research'))

function App() {
  return (
    <>
      <Navbar />
      <MouseTrail />
      <main className='space-y-24 pt-16'>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/learn' element={<Learn />} />
            <Route path='/learn/:slug' element={<Lesson />} />
            <Route path='/research' element={<Research />} />
            <Route path='/blog' element={<BlogIndex />} />
            <Route path='/blog/:slug' element={<BlogPost />} />
            <Route path='/store' element={<Store />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ScrollToTopButton />
    </>
  )
}

export default App
