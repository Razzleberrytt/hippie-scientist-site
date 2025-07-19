import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Gun } from '../types';

interface Props {
  gun: Gun;
}

export default function GunCardAccordion({ gun }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-black/40 backdrop-blur rounded-lg p-4 mb-4 shadow-md">
      <button
        className="w-full text-left flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-lg">{gun.name}</span>
        <span className="text-sm text-gray-400">{gun.manufacturer}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {gun.image && (
              <img
                src={gun.image}
                alt={gun.name}
                className="w-full h-40 object-cover rounded mt-2"
              />
            )}
            <div className="mt-2 space-y-1 text-sm">
              <p>Type: {gun.type}</p>
              <p>Caliber: {gun.caliber}</p>
              <p>Action: {gun.action}</p>
              <p>Capacity: {gun.capacity}</p>
              <p>Weight: {gun.weight}</p>
              <p>Origin: {gun.countryOfOrigin}</p>
              <p className="flex flex-wrap gap-1">
                {gun.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
