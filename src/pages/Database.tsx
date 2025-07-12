import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { herbsData } from '../data/herbsData';

const Database: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(herbsData.length / itemsPerPage);

  const paginatedHerbs = herbsData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClick = (page: number) => {
    setCurrentPage(page);
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
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 psychedelic-text">Database</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive information on psychoactive substances
            </p>
          </motion.div>

          {/* HERB GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedHerbs.map((herb, index) => (
              <div key={index} className="p-6 rounded shadow-md bg-white/10 text-white">
                <img src={herb.image} alt={herb.name} className="w-full h-40 object-cover rounded mb-4" />
                <h2 className="text-xl font-semibold mb-2">{herb.name}</h2>
                <p className="text-sm">{herb.description}</p>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center flex-wrap gap-2 mt-10">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleClick(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1 ? 'bg-purple-800 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Database;
