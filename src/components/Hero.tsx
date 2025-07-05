import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-pink-600 to-yellow-400 text-white text-center p-6">
      <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">The Hippie Scientist</h1>
      <p className="text-xl mb-8 max-w-2xl drop-shadow">
        Welcome to the nexus of legal highs, scientific insights, and psychedelic exploration.
      </p>
      <div className="flex gap-4">
        <Link
          to="/herbs"
          className="bg-white text-purple-700 font-bold py-2 px-6 rounded-full shadow hover:bg-purple-100 transition"
        >
          Explore Herb Index
        </Link>
      </div>
    </div>
  );
};

export default Hero;