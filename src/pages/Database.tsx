import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { herbsData } from '../data/herbs';
import { useHerbSearch } from '../hooks/search';
import HerbCard from '../components/HerbCard';
import SearchFilter from '../components/SearchFilter';

const Database: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDetailedModal, setShowDetailedModal] = useState<string | null>(null);

  const {
    filteredHerbs,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedEffects,
    setSelectedEffects,
    selectedSafetyRange,
    setSelectedSafetyRange,
    sortBy,
    setSortBy,
    totalResults,
    clearFilters
  } = useHerbSearch({ herbs: herbsData });

  const handleEffectToggle = (effect: string) => {
    setSelectedEffects(
      selectedEffects.includes(effect)
        ? selectedEffects.filter(e => e !== effect)
        : [...selectedEffects, effect]
    );
  };

  const selectedHerb = showDetailedModal ? herbsData.find(h => h.id === showDetailedModal) : null;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="psychedelic-text">Herb Database</span>
          </h1>
          <p className="text-xl opacity-80 max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive collection of psychoactive herbs with detailed research data, 
            safety information, and therapeutic applications.
          </p>
          <div className="flex items-center justify-center mt-6 space-x-4 text-sm opacity-70">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
              High Safety (8-10)
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
              Moderate Safety (6-7)
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
              Lower Safety (1-5)
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedEffects={selectedEffects}
          onEffectToggle={handleEffectToggle}
          selectedSafetyRange={selectedSafetyRange}
          onSafetyRangeChange={setSelectedSafetyRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={totalResults}
          onClearFilters={clearFilters}
        />

        {/* View Mode Toggle */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <span className="text-sm opacity-70">View:</span>
            <div className="flex space-x-1 bg-glass-light rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm rounded transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-psychedelic-purple text-white' 
                    : 'hover:bg-glass-medium'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-psychedelic-purple text-white' 
                    : 'hover:bg-glass-medium'
                }`}
              >
                List
              </button>
            </div>
          </div>

          <div className="text-sm opacity-70">
            Showing {filteredHerbs.length} of {herbsData.length} herbs
          </div>
        </motion.div>

        {/* Herb Grid/List */}
        <motion.div
          className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}
          layout
        >
          {filteredHerbs.map((herb) => (
            <HerbCard 
              key={herb.id} 
              herb={herb} 
              isCompact={viewMode === 'list'}
              onClick={() => setShowDetailedModal(herb.id)}
            />
          ))}
        </motion.div>

        {/* No Results */}
        {filteredHerbs.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-display font-semibold mb-2">No herbs found</h3>
            <p className="opacity-70 mb-6 max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="glass-button px-6 py-3"
            >
              Clear all filters
            </button>
          </motion.div>
        )}

        {/* Loading more indicator */}
        {filteredHerbs.length > 0 && (
          <motion.div
            className="text-center mt-12 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm opacity-60">
              Found {totalResults} herbs matching your criteria
            </p>
          </motion.div>
        )}
      </div>

      {/* Detailed Modal */}
      {selectedHerb && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowDetailedModal(null)}
        >
          <motion.div
            className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-display font-bold psychedelic-text">
                {selectedHerb.name}
              </h2>
              <button
                onClick={() => setShowDetailedModal(null)}
                className="p-2 hover:bg-glass-light rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal content would go here */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Scientific Name</h3>
                <p className="opacity-80">{selectedHerb.scientificName}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="opacity-80">{selectedHerb.description}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Effects</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHerb.effects.map((effect) => (
                    <span key={effect} className="px-3 py-1 bg-glass-light rounded-full text-sm">
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Safety Rating</h3>
                <p className="opacity-80">{selectedHerb.safetyRating}/10</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Database;
