// src/pages/Database.tsx

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import HerbCard from '../components/HerbCard';
import data from '../data/herbs.json';
import type { Herb } from '../types';

const herbs: Herb[] = data as Herb[];

export default function Database() {
  const [query, setQuery] = React.useState('');
  const filteredHerbs = herbs.filter((h) =>
    h.name.toLowerCase().includes(query.toLowerCase()) ||
    h.tags.some((t) => JSON.parse(`"${t}"`).toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      <Helmet>
        <title>Database - The Hippie Scientist</title>
        <meta
          name='description'
          content='Browse herbal entries and expand each to learn more about their effects and usage.'
        />
      </Helmet>

      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-7xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='mb-8 text-center'
          >
            <h1 className='psychedelic-text mb-6 text-5xl font-bold'>Herb Database</h1>
            <p className='mx-auto max-w-3xl text-xl text-gray-300'>
              Explore our collection of herbs. Click any entry to see detailed information.
            </p>
          </motion.div>

          <input
            type='text'
            placeholder='Search herbs...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='mb-8 w-full rounded-md border border-gray-700 bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500'
          />

          <div className='space-y-4'>
            {filteredHerbs.map((herb) => (
              <HerbCard key={herb.name} herb={herb} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
