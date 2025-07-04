import React from "react";

const Hero = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-extrabold mb-4 text-teal-300 drop-shadow-md">
        🌿 The Hippie Scientist
      </h1>
      <p className="text-lg text-gray-300 mb-6 max-w-xl text-center">
        Your psychedelic portal to legal highs, rare herbs, and chill scientific vibes. Enter the index, explore the blog, or visit the shop.
      </p>
      <div className="flex gap-4">
        <a href="#index" className="bg-teal-600 hover:bg-teal-700 px-6 py-3 rounded-lg font-semibold transition-all">
          Browse Index
        </a>
        <a href="#blog" className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-semibold transition-all">
          Read Blog
        </a>
      </div>
    </div>
  );
};

export default Hero;
