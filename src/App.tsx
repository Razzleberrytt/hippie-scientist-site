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
import { useGA } from './lib/useGA';
import HerbIndex from './pages/HerbIndex';
import HerbDetail from './pages/HerbDetail';
import Compare from './pages/Compare';
// Import other pages as needed

export default function App() {
  useGA();
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
        <Route path="/herb-index" element={<HerbIndex />} />
        <Route path="/herb/:slug" element={<HerbDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
