import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero.tsx';
import Header from './components/Header.tsx';
import HerbIndexPage from './components/HerbIndexPage.tsx';

function App() {
  return (
    <Router>
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 min-h-screen text-white font-sans">
        <Header />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/herb-index" element={<HerbIndexPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
