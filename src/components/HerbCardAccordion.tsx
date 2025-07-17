import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decodeTag } from '../../utils/decodeTag';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function HerbCardAccordion({ herb, open, toggle }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={toggle}
      className="rounded-xl bg-black/40 backdrop-blur-md ring-1 ring-emerald-400/20 shadow-lg p-6 text-white cursor-pointer hover:ring-emerald-300 transition-all"
    >
      <h2 className="text-xl font-bold text-emerald-300">{herb.name}</h2>
      <p className="text-sm text-slate-400">{herb.scientificName}</p>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mt-4 space-y-1"
          >
            {herb.category && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Category:</span> {herb.category}
              </motion.div>
            )}
            {herb.effects?.length > 0 && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Effects:</span> {herb.effects.join(', ')}
              </motion.div>
            )}
            {herb.therapeuticUses && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Therapeutic Uses:</span> {herb.therapeuticUses}
              </motion.div>
            )}
            {herb.sideEffects && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Side Effects:</span> {herb.sideEffects}
              </motion.div>
            )}
            {herb.contraindications && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Contraindications:</span> {herb.contraindications}
              </motion.div>
            )}
            {herb.drugInteractions && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Drug Interactions:</span> {herb.drugInteractions}
              </motion.div>
            )}
            {herb.preparation && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Preparation:</span> {herb.preparation}
              </motion.div>
            )}
            {herb.pharmacokinetics && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Pharmacokinetics:</span> {herb.pharmacokinetics}
              </motion.div>
            )}
            {herb.onset && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Onset:</span> {herb.onset}
              </motion.div>
            )}
            {herb.duration && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Duration:</span> {herb.duration}
              </motion.div>
            )}
            {herb.intensity && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Intensity:</span> {herb.intensity}
              </motion.div>
            )}
            {herb.region && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Region:</span> {herb.region}
              </motion.div>
            )}
            {herb.legalStatus && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Legal Status:</span> {herb.legalStatus}
              </motion.div>
            )}
            {herb.toxicity && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Toxicity:</span> {herb.toxicity}
              </motion.div>
            )}
            {herb.toxicityLD50 && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Toxicity LD50:</span> {herb.toxicityLD50}
              </motion.div>
            )}
            {herb.safetyRating != null && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Safety Rating:</span> {herb.safetyRating}
              </motion.div>
            )}
            {herb.mechanismOfAction && (
              <motion.div variants={itemVariants}>
                <span className="font-medium text-gold">Mechanism:</span> {herb.mechanismOfAction}
              </motion.div>
            )}
            {herb.tags?.length > 0 && (
              <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mt-2">
                {herb.tags.map((tag: string) => (
                  <motion.span
                    key={tag}
                    variants={itemVariants}
                    className="bg-emerald-700/30 text-emerald-200 px-3 py-1 rounded-full text-sm"
                  >
                    {decodeTag(tag)}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
