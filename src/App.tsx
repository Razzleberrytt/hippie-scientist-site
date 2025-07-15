import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Research from './pages/Research';
import Database from './pages/Database';
import Safety from './pages/Safety';
import Community from './pages/Community';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/database" element={<Database />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/community" element={<Community />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
