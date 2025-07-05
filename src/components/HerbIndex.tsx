// src/components/HerbIndex.tsx
import React, { useEffect, useState } from 'react';

type Herb = {
  name: string;
  effects: string;
  uses: string;
  mechanism?: string;
  toxicity?: string;
};

const HerbIndex: React.FC = () => {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/herb_index.json')
      .then((res) => res.json())
      .then((data) => {
        setHerbs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load herb data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center text-gray-300">Loading herbs...</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-teal-400 mb-6 text-center">🌿 Psychoactive Herb Index</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {herbs.map((herb, index) => (
          <div
            key={index}
            className="border border-teal-700 bg-gray-900 rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-white">{herb.name}</h3>
            <p><span className="text-teal-300">Effects:</span> {herb.effects}</p>
            <p><span className="text-teal-300">Uses:</span> {herb.uses}</p>
            {herb.mechanism && <p><span className="text-teal-300">MOA:</span> {herb.mechanism}</p>}
            {herb.toxicity && <p><span className="text-teal-300">Toxicity:</span> {herb.toxicity}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HerbIndex;
