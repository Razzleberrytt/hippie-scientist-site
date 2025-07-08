import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Herb } from '../data/herbs';

interface HerbCardProps {
  herb: Herb;
  onClick?: () => void;
  isCompact?: boolean;
}

const HerbCard: React.FC<HerbCardProps> = ({ herb, onClick, isCompact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSafetyColor = (rating: number): string => {
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    if (rating >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSafetyBgColor = (rating: number): string => {
    if (rating >= 8) return 'bg-green-400/20 border-green-400/30';
    if (rating >= 6) return 'bg-yellow-400/20 border-yellow-400/30';
    if (rating >= 4) return 'bg-orange-400/20 border-orange-400/30';
    return 'bg-red-400/20 border-red-400/30';
  };

  const getLegalStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('legal') && !statusLower.includes('varies')) return 'text-green-400';
    if (statusLower.includes('varies')) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <motion.div
      className="glass-card p-6 hover:glow-subtle transition-all duration-300 cursor-pointer"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${herb.name} herb information card`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-display font-semibold psychedelic-text mb-1">
            {herb.name}
          </h3>
          {herb.scientificName && (
            <p className="text-sm opacity-70 italic">{herb.scientificName}</p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className="px-3 py-1 bg-psychedelic-purple/20 text-psychedelic-purple border border-psychedelic-purple/30 rounded-full text-sm font-medium">
            {herb.category}
          </span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSafetyBgColor(herb.safetyRating)}`}>
            <span className={getSafetyColor(herb.safetyRating)}>
              Safety: {herb.safetyRating}/10
            </span>
          </div>
        </div>
      </div>

      {/* Effects */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-psychedelic-cyan flex items-center">
          <span className="mr-2">✨</span>Effects
        </h4>
        <div className="flex flex-wrap gap-1">
          {herb.effects.slice(0, isCompact ? 2 : 4).map((effect, index) => (
            <span key={index} className="px-3 py-1 bg-psychedelic-pink/20 text-psychedelic-pink border border-psychedelic-pink/30 rounded-full text-xs">
              {effect}
            </span>
          ))}
          {herb.effects.length > (isCompact ? 2 : 4) && (
            <span className="px-3 py-1 bg-psychedelic-pink/20 text-psychedelic-pink border border-psychedelic-pink/30 rounded-full text-xs opacity-70">
              +{herb.effects.length - (isCompact ? 2 : 4)} more
            </span>
          )}
        </div>
      </div>

      {!isCompact && (
        <>
          <p className="text-sm opacity-80 leading-relaxed mb-4">
            {herb.description}
          </p>

          <div className="flex items-center justify-between mb-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="opacity-70">Legal:</span>
              <span className={`font-medium ${getLegalStatusColor(herb.legalStatus)}`}>
                {herb.legalStatus}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {herb.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-psychedelic-cyan/20 text-psychedelic-cyan border border-psychedelic-cyan/30 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <motion.button
            className="w-full flex items-center justify-center py-2 text-sm font-medium text-psychedelic-purple hover:text-psychedelic-pink transition-colors duration-200 border-t border-white/10 mt-4 pt-4"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-label={isExpanded ? 'Hide research data' : 'Show research data'}
          >
            {isExpanded ? 'Hide Research Data' : 'Show Research Data'}
            <motion.svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.button>
        </>
      )}

      {/* Expanded Research Data */}
      <AnimatePresence>
        {isExpanded && !isCompact && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10 pt-6 mt-4"
          >
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-psychedelic-cyan mb-2 flex items-center">
                  <span className="mr-2">🧬</span>Mechanism of Action
                </h5>
                <p className="text-sm opacity-80 leading-relaxed bg-glass-light rounded-lg p-3">
                  {herb.mechanismOfAction}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-psychedelic-cyan mb-2 flex items-center">
                  <span className="mr-2">⏱️</span>Pharmacokinetics
                </h5>
                <p className="text-sm opacity-80 leading-relaxed bg-glass-light rounded-lg p-3">
                  {herb.pharmacokinetics}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-psychedelic-cyan mb-2 flex items-center">
                  <span className="mr-2">🏥</span>Therapeutic Uses
                </h5>
                <p className="text-sm opacity-80 leading-relaxed bg-glass-light rounded-lg p-3">
                  {herb.therapeuticUses}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-yellow-400 mb-2 flex items-center">
                    <span className="mr-2">⚠️</span>Side Effects
                  </h5>
                  <p className="text-sm opacity-80 leading-relaxed bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/20">
                    {herb.sideEffects}
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-red-400 mb-2 flex items-center">
                    <span className="mr-2">🚫</span>Contraindications
                  </h5>
                  <p className="text-sm opacity-80 leading-relaxed bg-red-400/10 rounded-lg p-3 border border-red-400/20">
                    {herb.contraindications}
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-orange-400 mb-2 flex items-center">
                    <span className="mr-2">💊</span>Drug Interactions
                  </h5>
                  <p className="text-sm opacity-80 leading-relaxed bg-orange-400/10 rounded-lg p-3 border border-orange-400/20">
                    {herb.drugInteractions}
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-purple-400 mb-2 flex items-center">
                    <span className="mr-2">🧪</span>Toxicity Data
                  </h5>
                  <p className="text-sm opacity-80 leading-relaxed bg-purple-400/10 rounded-lg p-3 border border-purple-400/20">
                    {herb.toxicityLD50}
                  </p>
                </div>
              </div>

              {herb.tags.length > 0 && (
                <div>
                  <h5 className="font-semibold text-psychedelic-cyan mb-2 flex items-center">
                    <span className="mr-2">🏷️</span>Tags
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {herb.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-psychedelic-cyan/20 text-psychedelic-cyan border border-psychedelic-cyan/30 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HerbCard;
