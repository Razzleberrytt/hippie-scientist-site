// src/App.tsx
import React from "react";

function App() {
  return (
    <main className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black min-h-screen text-white px-4 py-8">
      <section className="text-center space-y-4 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-extrabold text-purple-300 drop-shadow">
          🌌 The Hippie Scientist
        </h1>
        <p className="text-lg md:text-xl text-indigo-200 max-w-xl mx-auto">
          A psychedelic vortex of legal highs, botanical breakdowns, and
          mind-expanding science.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <a
            href="#herb-index"
            className="px-6 py-3 rounded bg-purple-600 hover:bg-purple-700 transition text-white shadow-md"
          >
            Browse Herb Index
          </a>
          <a
            href="#blog"
            className="px-6 py-3 rounded border border-purple-400 hover:bg-purple-800 transition text-purple-200"
          >
            Read the Blog
          </a>
        </div>
      </section>

      {/* Placeholder sections */}
      <section id="herb-index" className="mt-24">
        <h2 className="text-3xl font-bold text-purple-300 mb-4 text-center">
          🌿 Herb Index (Coming Soon)
        </h2>
        <p className="text-center text-indigo-200">
          A growing archive of legal psychoactives, mechanisms of action, and safe use guidance.
        </p>
      </section>

      <section id="blog" className="mt-24">
        <h2 className="text-3xl font-bold text-purple-300 mb-4 text-center">
          📓 Blog (Coming Soon)
        </h2>
        <p className="text-center text-indigo-200">
          Educational articles, deep dives, and news about mind-altering molecules.
        </p>
      </section>
    </main>
  );
}

export default App;
