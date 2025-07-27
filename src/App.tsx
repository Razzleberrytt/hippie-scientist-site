import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Database from './pages/Database';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';
// Import other pages as needed

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/database" element={<Database />} />
      <Route path="/favorites" element={<Favorites />} />
      {/* Add other routes here */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
