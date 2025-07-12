import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import HerbCard from '../components/HerbCard';
import SearchFilter from '../components/SearchFilter';
import { herbsData } from '../data/herbs';
import { Herb } from '../types/Herb';

const Database: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredHerbs, setFilteredHerbs] = useState<Herb[]>(herbsData);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredHerbs.length / itemsPerPage);

  const paginatedHerbs = filteredHerbs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilter = (results: Herb[]) => {
    setFilteredHerbs(results);
    setCurrentPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Database - The Hippie Scientist</title>
        <meta name="description" content="Comprehensive database of psychoactive substances and their effects." />
      </Helmet>

      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 psychedelic-text">Database</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive information on psychoactive substances
            </p>
          </motion.div>

          <SearchFilter herbs={herbsData} onFilter={handleFilter} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedHerbs.map((herb) => (
              <HerbCard key={herb.id} herb={herb} />
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="bg-purple-700 px-4 py-2 rounded text-white disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? 'bg-purple-900 text-white' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-purple-700 px-4 py-2 rounded text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Database;
