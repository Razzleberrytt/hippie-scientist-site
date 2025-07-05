import React, { useEffect, useState } from "react";
import herbData from "../data/herb_index.json";

interface Herb {
  name: string;
  tags: string;
  moa: string;
  uses: string;
  sideEffects: string;
  contraindications: string;
  drugInteractions: string;
  toxicity: string;
}

const HerbIndex = () => {
  const [herbs, setHerbs] = useState<Herb[]>([]);

  useEffect(() => {
    setHerbs(herbData);
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-teal-300 text-center">
        🌿 Psychoactive Herb Index
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {herbs.map((herb, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-white">{herb.name}</h3>
            <p className="text-sm text-gray-400 mb-2">{herb.tags}</p>
            <details className="text-sm text-gray-300">
              <summary className="cursor-pointer text-teal-400">More Info</summary>
              <ul className="pl-4 mt-2 list-disc space-y-1">
                <li><strong>MOA:</strong> {herb.moa}</li>
                <li><strong>Uses:</strong> {herb.uses}</li>
                <li><strong>Side Effects:</strong> {herb.sideEffects}</li>
                <li><strong>Contraindications:</strong> {herb.contraindications}</li>
                <li><strong>Interactions:</strong> {herb.drugInteractions}</li>
                <li><strong>Toxicity:</strong> {herb.toxicity}</li>
              </ul>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HerbIndex;
