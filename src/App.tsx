// src/App.tsx
import React from 'react';
import HerbIndex from './components/HerbIndex.tsx';

function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold text-teal-400">The Hippie Scientist</h1>
        <p className="text-gray-300">Exploring Nature’s Psychedelics One Herb at a Time</p>
      </header>
      <main>
        <HerbIndex />
      </main>
    </div>
  );
}

export default App;
