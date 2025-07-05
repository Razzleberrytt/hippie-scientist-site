import React, { useEffect, useState } from 'react';

interface Herb {
  name: string;
  description: string;
  tags: string[];
  mechanism: string;
  uses: string;
  toxicity: string;
}

const HerbIndex: React.FC = () => {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/herbs.json')
      .then((res) => res.json())
      .then((data) => {
        setHerbs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load herbs.json:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-white">Loading herbs...</p>;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {herbs.map((herb, index) => (
        <div key={index} className="border border-purple-400 p-4 rounded-lg bg-black text-white shadow-lg">
          <h2 className="text-xl font-bold text-green-300">{herb.name}</h2>
          <p className="text-sm text-gray-400 mb-2 italic">{herb.tags.join(', ')}</p>
          <p><strong>Description:</strong> {herb.description}</p>
          <p><strong>Mechanism:</strong> {herb.mechanism}</p>
          <p><strong>Uses:</strong> {herb.uses}</p>
          <p><strong>Toxicity:</strong> {herb.toxicity}</p>
        </div>
      ))}
    </div>
  );
};

export default HerbIndex;
