import { useState } from 'react';
import type { Herb } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  herb: Herb;
}

function decodeTag(tag: string) {
  try {
    return JSON.parse(`"${tag}"`);
  } catch {
    return tag;
  }
}

export default function HerbCard({ herb }: Props) {
  const [open, setOpen] = useState(false);

  const safetyColor =
    herb.safetyRating && herb.safetyRating <= 1
      ? 'text-green-400'
      : herb.safetyRating === 2
        ? 'text-yellow-300'
        : 'text-red-400';

  return (
    <div className="glass-card overflow-hidden rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between p-4 text-left"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-lg font-semibold leading-snug">{herb.name}</h2>
          {herb.scientificName && (
            <p className="text-xs italic text-gray-400">{herb.scientificName}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {herb.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-2 py-0.5 text-xs"
              >
                {decodeTag(tag)}
              </span>
            ))}
          </div>
        </div>
        <ChevronDown
          className={clsx('mt-1 h-5 w-5 transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden px-4 pb-4 text-sm text-gray-200"
          >
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <p>
                <strong>Category:</strong> {herb.category}
              </p>
              <p>
                <strong>Intensity:</strong> {herb.intensity}
              </p>
              <p>
                <strong>Onset:</strong> {herb.onset}
              </p>
              <p>
                <strong>Preparation:</strong> {herb.preparation}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <p>
                <strong>Region:</strong> {herb.region}
              </p>
              <p>
                <strong>Legal:</strong> {herb.legalStatus}
              </p>
              <p>
                <strong>Safety:</strong>{' '}
                <span className={safetyColor}>{herb.safetyRating ?? 'N/A'}</span>
              </p>
            </div>
            {herb.effects.length > 0 && (
              <div>
                <strong>Effects:</strong>
                <ul className="list-disc pl-5">
                  {herb.effects.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            {herb.description && <p>{herb.description}</p>}

            {[
              ['Mechanism of Action', herb.mechanismOfAction],
              ['Pharmacokinetics', herb.pharmacokinetics],
              ['Therapeutic Uses', herb.therapeuticUses],
              ['Side Effects', herb.sideEffects],
              ['Contraindications', herb.contraindications],
              ['Drug Interactions', herb.drugInteractions],
              ['Toxicity', herb.toxicity],
              ['Toxicity LD50', herb.toxicityLD50],
            ].map(
              ([title, content]) =>
                content && (
                  <details key={title} className="pt-1">
                    <summary className="cursor-pointer select-none font-medium">
                      {title}
                    </summary>
                    <p className="mt-1 pl-2 text-gray-300">{content}</p>
                  </details>
                ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
