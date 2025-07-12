import React, { useState } from 'react';
import { herbsData } from '../data/herbs';
import HerbCard from '../components/HerbCard';
import { Herb } from '../types/Herb';

const Database: React.FC = () => {
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null);

  const handleCardClick = (herb: Herb) => {
    setSelectedHerb(selectedHerb?.id === herb.id ? null : herb);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Herbal Database</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {herbsData.map((herb) => (
          <div key={herb.id}>
            <HerbCard herb={herb} onClick={() => handleCardClick(herb)} />
            {selectedHerb?.id === herb.id && (
              <div className="mt-4 p-4 bg-black bg-opacity-30 rounded-lg text-sm text-gray-200 border border-gray-600">
                <p><strong>Mechanism of Action:</strong> {herb.mechanismOfAction}</p>
                <p><strong>Pharmacokinetics:</strong> {herb.pharmacokinetics}</p>
                <p><strong>Therapeutic Uses:</strong> {herb.therapeuticUses}</p>
                <p><strong>Side Effects:</strong> {herb.sideEffects}</p>
                <p><strong>Contraindications:</strong> {herb.contraindications}</p>
                <p><strong>Drug Interactions:</strong> {herb.drugInteractions}</p>
                <p><strong>Toxicity (LD50):</strong> {herb.toxicityLD50}</p>
                <p><strong>Legal Status:</strong> {herb.legalStatus}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Database;
