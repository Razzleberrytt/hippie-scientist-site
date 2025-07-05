import React, { useEffect, useState } from 'react';
import herbData from '../data/herbs.json';

type Herb = {
  name: string;
  effects: string[];
  origin: string;
  category: string;
};

const HerbIndex = () => {
  const [herbs, setHerbs] = useState<Herb[]>([]);

  useEffect(() => {
    setHerbs(herbData);
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Herb Index</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {herbs.map((herb, i) => (
          <div
            key={i}
            className="border border-gray-600 rounded p-4 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-md"
          >
            <h3 className="text-xl font-semibold">{herb.name}</h3>
            <p><strong>Category:</strong> {herb.category}</p>
            <p><strong>Origin:</strong> {herb.origin}</p>
            <p><strong>Effects:</strong> {herb.effects.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HerbIndex;
