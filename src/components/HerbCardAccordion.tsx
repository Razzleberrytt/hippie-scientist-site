import React from 'react';
import { motion } from 'framer-motion';
import { Herb } from '../types/Herb';

interface Props {
  herb: Herb;
}

export default function HerbCardAccordion({ herb }: Props) {
  const safeTags = Array.isArray(herb.tags) ? herb.tags : [];
  const safeEffects = Array.isArray(herb.effects) ? herb.effects : [];

  return (
    <motion.div
      layout
      className="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <h2 className="text-xl font-bold text-lime-300">{herb.name || 'Unknown Herb'}</h2>
      <p className="text-sm text-sand italic">{herb.scientificName || 'Unknown species'}</p>
      <div className="mt-2 text-sm text-white">
        <strong>Effects:</strong>{' '}
        {safeEffects.length > 0 ? safeEffects.join(', ') : 'Unknown'}
      </div>
      <div className="mt-2 text-sm text-white">
        <strong>Description:</strong>{' '}
        {herb.description || 'No description provided.'}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {safeTags.map((tag, index) => (
          <span
            key={index}
            className="bg-cyan-700/50 text-xs px-2 py-1 rounded-full text-white shadow"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}