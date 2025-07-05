import React, { useEffect, useState } from 'react';

interface Herb {
  name: string;
  moa: string;
  pharmacokinetics: string;
  uses: string;
  sideEffects: string;
  contraindications: string;
  interactions: string;
  toxicity: string;
  image?: string;
}

const HerbIndex: React.FC = () => {
  const [herbs, setHerbs] = useState<Herb[]>([]);

  useEffect(() => {
    fetch('/herb_index.json')
      .then((res) => res.json())
      .then(setHerbs)
      .catch((err) => console.error('Failed to load herb index:', err));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center text-green-700">Psychoactive Herb Index</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {herbs.map((herb, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-4 border border-green-200">
            <h2 className="text-xl font-semibold mb-2">{herb.name}</h2>
            {herb.image && (
              <img src={herb.image} alt={herb.name} className="w-full h-auto rounded mb-2" />
            )}
            <p><strong>MOA:</strong> {herb.moa}</p>
            <p><strong>Pharmacokinetics:</strong> {herb.pharmacokinetics}</p>
            <p><strong>Uses:</strong> {herb.uses}</p>
            <p><strong>Side Effects:</strong> {herb.sideEffects}</p>
            <p><strong>Contraindications:</strong> {herb.contraindications}</p>
            <p><strong>Interactions:</strong> {herb.interactions}</p>
            <p><strong>Toxicity:</strong> {herb.toxicity}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HerbIndex;
