import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Herb } from '../types/Herb';

interface HerbCardProps {
  herb: Herb;
  onClick?: () => void;
}

const HerbCard: React.FC<HerbCardProps> = ({ herb, onClick }) => {
  const getSafetyIcon = (rating: Herb['safetyRating']) => {
    switch (rating) {
      case 'high':
        return <CheckCircle className="w-4 h-4 text-psychedelic-green" aria-label="High safety rating" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-psychedelic-orange" aria-label="Medium safety rating" />;
      case 'low':
        return <Shield className="w-4 h-4 text-psychedelic-pink" aria-label="Low safety rating" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" aria-label="Unknown safety rating" />;
    }
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      className="bg-opacity-10 backdrop-blur-md glass-card rounded-lg p-4 border border-gray-700 cursor-pointer transition-all"
    >
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

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">{herb.name}</h3>
        {getSafetyIcon(herb.safetyRating)}
      </div>

      <p className="text-sm italic text-gray-400 mb-2">{herb.scientificName}</p>
      <p className="text-sm text-gray-300 mb-2 line-clamp-3">{herb.description}</p>

      <div className="flex flex-wrap gap-1 mt-2">
        {herb.tags.map(tag => (
          <span key={tag} className="text-xs bg-psychedelic-purple/20 text-purple-300 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default HerbCard;
