import React from 'react'
import { motion } from 'framer-motion'
import HerbList from '../components/HerbList'
import HeroSection from '../components/HeroSection'
import { herbs } from '../data/herbs'

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-br from-black via-indigo-950 to-slate-900 text-white">
      <HeroSection />
      <section className="space-y-10 max-w-4xl mx-auto">
        {/* 🌿 Herb Index */}
        <motion.div layout>
          <h2 className="mb-4 font-display text-3xl text-gradient">Herb Index</h2>
          <HerbList herbs={herbs} />
        </motion.div>
      </section>
    </main>
  );
}
