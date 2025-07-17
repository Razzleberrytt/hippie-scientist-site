import React from 'react';
import { motion } from 'framer-motion';
import HerbCardAccordion from '../components/HerbCardAccordion';
import HerbList from '../components/HerbList';
import { herbs } from '../data/herbs'; // Adjust if you're importing differently

export default function Home() {
  const featured = herbs[0]; // Pick a featured herb for now

  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-br from-black via-indigo-950 to-slate-900 text-white">
      <section className="space-y-10 max-w-4xl mx-auto">

        {/* 🌟 Featured Herb */}
        <div>
          <h2 className="mb-4 font-display text-3xl text-gold">Featured Herb</h2>
          <HerbCardAccordion herb={featured} />
        </div>

        {/* 🌿 Herb Index */}
        <div>
          <h2 className="mb-4 font-display text-3xl text-gold">Herb Index</h2>
          <HerbList herbs={herbs} />
        </div>

      </section>
    </main>
  );
}
