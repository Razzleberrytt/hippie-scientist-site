import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { LoadingScreen } from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MouseTrail from './components/MouseTrail'
import ScrollToTopButton from './components/ScrollToTopButton'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
const Home = React.lazy(() => import('./pages/Home'))
const BlogIndex = React.lazy(() => import('./pages/BlogIndex'))
const BlogPost = React.lazy(() => import('./pages/BlogPost'))
const HerbDetail = React.lazy(() => import('./pages/HerbDetail'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const Learn = React.lazy(() => import('./pages/Learn'))
const Lesson = React.lazy(() => import('./pages/Lesson'))
const About = React.lazy(() => import('./pages/About'))
const Database = React.lazy(() => import('./pages/Database'))
const Store = React.lazy(() => import('./pages/Store'))
const Research = React.lazy(() => import('./pages/Research'))
const Bookmarks = React.lazy(() => import('./pages/Bookmarks'))
const Favorites = React.lazy(() => import('./pages/Favorites'))
const Compounds = React.lazy(() => import('./pages/Compounds'))
const Compare = React.lazy(() => import('./pages/Compare'))

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Navbar />
      <MouseTrail />
      <main className='space-y-24 pt-16'>
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/about' element={<About />} />
              <Route path='/learn' element={<Learn />} />
              <Route path='/learn/:slug' element={<Lesson />} />
              <Route path='/database' element={<Database />} />
              <Route path='/research' element={<Research />} />
              <Route path='/blog' element={<BlogIndex />} />
              <Route path='/blog/:slug' element={<BlogPost />} />
              <Route path='/herbs/:id' element={<HerbDetail />} />
              <Route path='/herb/:id' element={<HerbDetail />} />
              <Route path='/bookmarks' element={<Bookmarks />} />
              <Route path='/favorites' element={<Favorites />} />
              <Route path='/compounds' element={<Compounds />} />
              <Route path='/compare' element={<Compare />} />
              <Route path='/store' element={<Store />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <ScrollToTopButton />
    </HashRouter>
  )
}

export default App
