import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MouseTrail from './components/MouseTrail'
import ScrollToTopButton from './components/ScrollToTopButton'
import FogOverlay from './components/FogOverlay'
import { LoadingScreen } from './components/LoadingScreen'
import { routes } from './routes'
function App() {
  return (
    <>
      <Navbar />
      <MouseTrail />
      <FogOverlay />
      <main className='space-y-24 pt-16'>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ScrollToTopButton />
    </>
  )
}

export default App
