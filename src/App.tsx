import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import BlogIndex from './pages/BlogIndex'
import BlogPost from './pages/BlogPost'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      <Navbar />
      <main className='pt-20'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/blog' element={<BlogIndex />} />
          <Route path='/blog/:slug' element={<BlogPost />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
