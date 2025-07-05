import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HerbIndexPage from './components/HerbIndexPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <header className="text-center py-6">
          <h1 className="text-4xl font-bold text-teal-400">The Hippie Scientist</h1>
          <p className="text-gray-300">Exploring Natural Psychoactive Herbs</p>
          <nav className="mt-4">
            <Link to="/" className="text-teal-300 hover:underline px-2">Home</Link>
            <Link to="/herb-index" className="text-teal-300 hover:underline px-2">Herb Index</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<p className="text-center mt-10">Welcome to The Hippie Scientist.</p>} />
            <Route path="/herb-index" element={<HerbIndexPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
