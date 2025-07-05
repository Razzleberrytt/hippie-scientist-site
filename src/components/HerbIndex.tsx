import React, { useEffect, useState } from 'react';

type Herb = {
  name: string;
  effects: string[];
  origin: string;
  category: string;
};

const HerbIndex = () => {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/herbs.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setHerbs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load herbs:', err);
        setError('Failed to load herb data.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-3xl font-bold mb-6">🌿 Psychoactive Herb Index</h2>

      {loading && <p className="text-lg text-gray-300">Loading herbs...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {herbs.map((herb, i) => (
          <div key={i} className="border border-purple-500 rounded-lg p-4 bg-purple-900 bg-opacity-20 shadow-md">
            <h3 className="text-xl font-bold text-pink-300">{herb.name}</h3>
            <p className="text-sm text-gray-300 mt-1">
              <strong>Origin:</strong> {herb.origin}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Category:</strong> {herb.category}
            </p>
            <div className="mt-2">
              <p className="text-sm font-semibold text-green-300">Effects:</p>
              <ul className="list-disc list-inside text-sm text-gray-200">
                {herb.effects.map((effect, idx) => (
                  <li key={idx}>{effect}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HerbIndex;
