import React from 'react';
import HerbIndex from './components/HerbIndex.tsx';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold text-teal-400">The Hippie Scientist</h1>
        <p className="text-gray-300">Exploring Natural Psychoactive Herbs</p>
      </header>
      <main>
        <HerbIndex />
      </main>
    </div>
  );
}

export default App;
