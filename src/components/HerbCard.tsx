import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Herb } from '../types/Herb';

interface HerbCardProps {
  herb: Herb;
  onClick?: () => void;
}

const HerbCard: React.FC<HerbCardProps> = ({ herb, onClick }) => {
  const getSafetyIcon = (rating: string) => {
    switch (rating) {
      case 'high':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'low':
        return <Shield className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-lg p-4 border border-gray-700 bg-opacity-10 backdrop-blur-md transition shadow-md hover:shadow-xl"
    >
      {/* Image */}
      {herb.image ? (
        <img
          src={herb.image}
          alt={herb.name}
          className="w-full h-40 object-cover rounded-md mb-4"
        />
      ) : (
        <div className="w-full h-40 bg-gray-800 rounded-md mb-4 flex items-center justify-center text-gray-400">
          No image available
        </div>
      )}

      {/* Name */}
      <h2 className="text-xl font-bold text-white mb-1">{herb.name}</h2>
      <p className="text-sm text-gray-400 italic mb-2">{herb.scientificName}</p>

      {/* Details */}
      <div className="text-sm text-gray-300 space-y-1 mb-2">
        <p><strong>Category:</strong> {herb.category}</p>
        <p><strong>Region:</strong> {herb.region}</p>
        <p><strong>Intensity:</strong> {herb.intensity} | <strong>Onset:</strong> {herb.onset}</p>
        <p><strong>Effects:</strong> {herb.effects.join(', ')}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {herb.tags.map((tag, i) => (
          <span
            key={i}
            className="bg-pink-800 bg-opacity-30 border border-pink-500 text-xs px-2 py-1 rounded-full text-white"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Safety */}
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
        <span>Safety:</span>
        {getSafetyIcon(herb.safetyRating)}
      </div>
    </motion.div>
  );
};

export default HerbCard;
