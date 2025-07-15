import React, { useState } from 'react'
import type { Herb } from '../types/Herb'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

interface HerbCardProps {
  herb: Herb
}

export function HerbCard({ herb }: HerbCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className='glass-card overflow-hidden rounded-lg'>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='flex w-full items-center justify-between p-4 text-left'
        aria-expanded={open}
      >
        <div>
          <h2 className='text-xl font-semibold'>{herb.name}</h2>
          <p className='text-sm text-gray-300'>{herb.effects?.join(', ')}</p>
        </div>
        <ChevronDown className={clsx('h-5 w-5 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key='content'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='space-y-2 overflow-hidden px-4 pb-4 text-sm text-gray-200'
          >
            {herb.scientificName && (
              <p>
                <strong>Scientific Name:</strong> {herb.scientificName}
              </p>
            )}
            {herb.description && (
              <p>
                <strong>Description:</strong> {herb.description}
              </p>
            )}
            {herb.mechanismOfAction && (
              <p>
                <strong>Mechanism of Action:</strong> {herb.mechanismOfAction}
              </p>
            )}
            {herb.pharmacokinetics && (
              <p>
                <strong>Pharmacokinetics:</strong> {herb.pharmacokinetics}
              </p>
            )}
            {herb.therapeuticUses && (
              <p>
                <strong>Therapeutic Uses:</strong> {herb.therapeuticUses}
              </p>
            )}
            {herb.sideEffects && (
              <p>
                <strong>Side Effects:</strong> {herb.sideEffects}
              </p>
            )}
            {herb.contraindications && (
              <p>
                <strong>Contraindications:</strong> {herb.contraindications}
              </p>
            )}
            {herb.drugInteractions && (
              <p>
                <strong>Drug Interactions:</strong> {herb.drugInteractions}
              </p>
            )}
            {herb.toxicityLD50 && (
              <p>
                <strong>Toxicity/LD50:</strong> {herb.toxicityLD50}
              </p>
            )}
            {herb.safetyRating && (
              <p>
                <strong>Safety Rating:</strong> {herb.safetyRating}
              </p>
            )}
            {herb.legalStatus && (
              <p>
                <strong>Legal Status:</strong> {herb.legalStatus}
              </p>
            )}
            {herb.region && (
              <p>
                <strong>Region:</strong> {herb.region}
              </p>
            )}
            {herb.onset && (
              <p>
                <strong>Onset:</strong> {herb.onset}
              </p>
            )}
            {herb.intensity && (
              <p>
                <strong>Intensity:</strong> {herb.intensity}
              </p>
            )}
            {herb.preparation && (
              <p>
                <strong>Preparation:</strong> {herb.preparation}
              </p>
            )}
            {herb.tags?.length > 0 && (
              <p>
                <strong>Tags:</strong> {herb.tags.join(', ')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
