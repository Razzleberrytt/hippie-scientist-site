import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { LoadingScreen } from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MouseTrail from './components/MouseTrail'
import ScrollToTopButton from './components/ScrollToTopButton'
const Home = React.lazy(() => import('./pages/Home'))
const HerbDetail = React.lazy(() => import('./pages/HerbDetail'))
const HerbDetailView = React.lazy(() => import('./pages/HerbDetailView'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const Learn = React.lazy(() => import('./pages/Learn'))
const Lesson = React.lazy(() => import('./pages/Lesson'))
const About = React.lazy(() => import('./pages/About'))
const Database = React.lazy(() => import('./pages/Database'))
const Store = React.lazy(() => import('./pages/Store'))
const Research = React.lazy(() => import('./pages/Research'))
const Compounds = React.lazy(() => import('./pages/Compounds'))
const Downloads = React.lazy(() => import('./pages/Downloads'))

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
            <Route path='/database' element={<Database />} />
            <Route path='/research' element={<Research />} />
            <Route path='/herbs/:id' element={<HerbDetail />} />
            <Route path='/herb/:id' element={<HerbDetailView />} />
            <Route path='/compounds' element={<Compounds />} />
            <Route path='/store' element={<Store />} />
            <Route path='/downloads' element={<Downloads />} />
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
