import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Database from './pages/Database';
import Favorites from './pages/Favorites';
import HerbBlender from './pages/HerbBlender';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import { RedirectHandler } from './RedirectHandler';
// Import other pages as needed

export default function App() {
  return (
    <>
      <RedirectHandler />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/database" element={<Database />} />
        <Route path="/blend" element={<HerbBlender />} />
        <Route path="/favorites" element={<Favorites />} />
        {/* Add other routes here */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
