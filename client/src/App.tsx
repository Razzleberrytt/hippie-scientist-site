import React from "react";

function App() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1a0025] via-[#420e56] to-[#1a0025] text-white overflow-hidden font-sans transition-colors duration-500">
      {/* Animated floating particles background layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)] animate-pulse" />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-500 animate-text-glow">
          🌿 The Hippie Scientist
        </h1>

        <p className="text-lg md:text-xl text-gray-300 text-center max-w-xl">
          Welcome to your psychedelic hub of herb wisdom, legal highs, and vibed-out science.
        </p>

        <a
          href="#herb-index"
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded shadow transition-all hover:scale-105"
        >
          🌱 Browse the Index
        </a>
      </main>
    </div>
  );
}

export default App;
