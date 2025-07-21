import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Herb } from '../types/Herb';

interface Props {
  herb: Herb;
}

export default function HerbCardAccordion({ herb }: Props) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(prev => !prev);
  const safeTags = Array.isArray(herb.tags) ? herb.tags : [];
  const safeEffects = Array.isArray(herb.effects) ? herb.effects : [];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={toggleExpanded}
      className="cursor-pointer rounded-xl border border-white/20 bg-gradient-to-br from-black/30 to-black/10 p-4 shadow-md backdrop-blur-md transition-all hover:shadow-xl"
    >
      <h2 className="text-xl font-bold text-lime-300">{herb.name || 'Unknown Herb'}</h2>
      <p className="italic text-sand text-sm">{herb.scientificName || 'Unknown species'}</p>

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

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-2 text-sm text-sand"
          >
            <p><strong>Mechanism:</strong> {herb.mechanismOfAction || 'Unknown'}</p>
            <p><strong>Pharmacokinetics:</strong> {herb.pharmacokinetics || 'Unknown'}</p>
            <p><strong>Therapeutic Uses:</strong> {herb.therapeuticUses || 'Unknown'}</p>
            <p><strong>Side Effects:</strong> {herb.sideEffects || 'Unknown'}</p>
            <p><strong>Contraindications:</strong> {herb.contraindications || 'Unknown'}</p>
            <p><strong>Drug Interactions:</strong> {herb.drugInteractions || 'Unknown'}</p>
            <p><strong>Region:</strong> {herb.region || 'Unknown'}</p>
            <p><strong>Legal Status:</strong> {herb.legalStatus || 'Unknown'}</p>
            <p><strong>Safety Rating:</strong> {herb.safetyRating || 'Unknown'}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}