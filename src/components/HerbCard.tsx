import { useState } from 'react';
import type { Herb } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  herb: Herb;
}

export default function HerbCard({ herb }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card overflow-hidden rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center space-x-4">
          <img
            src={herb.image}
            alt=""
            className="h-12 w-12 rounded-md object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold">{herb.name}</h2>
            <p className="text-sm text-gray-300">{herb.effects.join(', ')}</p>
          </div>
        </div>
        <ChevronDown className={clsx('h-5 w-5 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 overflow-hidden px-4 pb-4 text-sm text-gray-200"
          >
            <p>
              <strong>Origin:</strong> {herb.origin}
            </p>
            <p>{herb.description}</p>
            <p>
              <strong>Safety:</strong> {herb.safetyLevel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
