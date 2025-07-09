import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-[#0f0e17] text-white flex flex-col items-center justify-center text-center px-6">
      <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 mb-4">
        HIPPIE SCIENTIST
      </div>
      <p className="text-lg max-w-xl mb-6">
        Exploring the frontiers of consciousness through <span className="text-pink-400">psychedelic research</span>, <span className="text-purple-400">ancient wisdom</span>, and <span className="text-blue-400">modern science</span>.
      </p>
      <div className="flex gap-4">
        <button className="bg-white text-black font-semibold py-2 px-4 rounded shadow hover:scale-105 transition">
          Begin Journey
        </button>
        <button className="border border-white py-2 px-4 rounded hover:bg-white hover:text-black transition">
          Explore Database
        </button>
      </div>
    </div>
  )
}

export default App
