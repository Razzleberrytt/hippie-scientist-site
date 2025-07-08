import React from 'react';
import { motion } from 'framer-motion';
import { categories, effectTags } from '../data/herbs';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedEffects: string[];
  onEffectToggle: (effect: string) => void;
  selectedSafetyRange: [number, number];
  onSafetyRangeChange: (range: [number, number]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
  onClearFilters: () => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedEffects,
  onEffectToggle,
  selectedSafetyRange,
  onSafetyRangeChange,
  sortBy,
  onSortChange,
  totalResults,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'category', label: 'Category' },
    { value: 'safety', label: 'Safety Rating' },
    { value: 'effects', label: 'Number of Effects' }
  ];

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || selectedEffects.length > 0 || 
    selectedSafetyRange[0] !== 1 || selectedSafetyRange[1] !== 10;

  return (
    <motion.div
      className="glass-card p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Bar and Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Search Herbs
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="Search by name, effects, mechanism, or any research data..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="glass-card px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-psychedelic-purple/50 pr-12"
              autoComplete="off"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="mr-2 p-1 hover:bg-glass-light rounded"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="min-w-[200px]">
            <label htmlFor="sort" className="block text-sm font-medium mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="glass-card px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-psychedelic-purple/50"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div className="text-sm opacity-70 mb-2">
              {totalResults} results
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="glass-button px-4 py-2 text-sm whitespace-nowrap"
            >
              {isExpanded ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filters */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="border-t border-white/10 pt-6 space-y-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center">
              <span className="mr-2">📂</span>Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-psychedelic-purple/20 text-psychedelic-purple border border-psychedelic-purple/30 glow-subtle'
                      : 'bg-glass-light border border-white/20 hover:border-psychedelic-purple/50'
                  }`}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                  {selectedCategory === category && (
                    <span className="ml-1">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Safety Rating Filter */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center">
              <span className="mr-2">🛡️</span>Safety Rating: {selectedSafetyRange[0]} - {selectedSafetyRange[1]}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm opacity-70">1</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={selectedSafetyRange[0]}
                  onChange={(e) => onSafetyRangeChange([parseInt(e.target.value), selectedSafetyRange[1]])}
                  className="w-full h-2 bg-glass-light rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={selectedSafetyRange[1]}
                  onChange={(e) => onSafetyRangeChange([selectedSafetyRange[0], parseInt(e.target.value)])}
                  className="absolute top-0 w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <span className="text-sm opacity-70">10</span>
            </div>
          </div>

          {/* Effects Filter */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center">
              <span className="mr-2">✨</span>Effects ({selectedEffects.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {effectTags.map((effect) => (
                <button
                  key={effect}
                  onClick={() => onEffectToggle(effect)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedEffects.includes(effect)
                      ? 'bg-psychedelic-pink/20 text-psychedelic-pink border border-psychedelic-pink/30 glow-subtle'
                      : 'bg-glass-light border border-white/20 hover:border-psychedelic-pink/50'
                  }`}
                  aria-pressed={selectedEffects.includes(effect)}
                >
                  {effect}
                  {selectedEffects.includes(effect) && (
                    <span className="ml-1">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <motion.div
          className="border-t border-white/10 pt-4 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={onClearFilters}
            className="text-sm text-psychedelic-pink hover:text-psychedelic-purple transition-colors duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all filters
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchFilter;
