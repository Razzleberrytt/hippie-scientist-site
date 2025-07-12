import React from 'react';
import HerbCard from '../components/HerbCard';
import { herbsData } from '../data/herbs';

const DatabasePage: React.FC = () => {
  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {herbsData.map((herb) => (
        <HerbCard key={herb.id} herb={herb} />
      ))}
    </div>
  );
};

export default DatabasePage;
