import React, { useEffect, useState } from 'react';

type Herb = {
  name: string;
  effects: string[];
  origin: string;
  category: string;
};

const HerbIndex = () => {
  const [herbs, setHerbs] = useState<Herb[]>([]);

  useEffect(() => {
    fetch('/herbs.json')
      .then((res) => res.json())
      .then((data) => setHerbs(data))
      .catch((err) => console.error('Failed to load herb data:', err));
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">🌿 Herb Index</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {herbs.map((herb, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-purple-800 to-indigo-900 p-4 rounded-lg shadow-md border border-purple-700"
          >
            <h3 className="text-xl font-bold text-green-300 mb-2">{herb.name}</h3>
            <p className="text-sm text-gray-300"><strong>Origin:</strong> {herb.origin}</p>
            <p className="text-sm text-gray-300"><strong>Category:</strong> {herb.category}</p>
            <p className="text-sm text-gray-400 mt-2"><strong>Effects:</strong> {herb.effects.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HerbIndex;
