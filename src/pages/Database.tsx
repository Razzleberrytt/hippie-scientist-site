// src/pages/Database.tsx

import React from 'react';
import { HerbCard } from '../components/HerbCard';
import { herbsData } from '../data/herbs';

export default function Database() {
  return (
    <div className="database">
      {herbsData.map((herb) => (
        <HerbCard key={herb.id} herb={herb} />
      ))}
    </div>
  );
}
