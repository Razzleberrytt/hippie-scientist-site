// src/App.tsx
import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🌿 The Hippie Scientist</h1>
        <p className="text-lg text-gray-300">Welcome to your psychedelic hub of herb info and chill vibes.</p>
        <button className="bg-teal-600 px-4 py-2 rounded hover:bg-teal-700 transition">
          Browse the Index
        </button>
      </div>
    </div>
  );
}

export default App;
