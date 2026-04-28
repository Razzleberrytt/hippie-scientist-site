import React, { useState } from 'react';
import { firearms } from '../data/firearms';
import FirearmCard from '../components/FirearmCard';

const uniqueTypes = Array.from(new Set(firearms.map(f => f.type)));

const FirearmsPage: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const filtered = filter === 'All' ? firearms : firearms.filter(f => f.type === filter);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">Firearms Index</h1>
      <div className="mb-4 space-x-2">
        <button
          className={`px-3 py-1 rounded ${filter === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}
          onClick={() => setFilter('All')}
        >
          All
        </button>
        {uniqueTypes.map(type => (
          <button
            key={type}
            className={`px-3 py-1 rounded ${filter === type ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(firearm => (
          <FirearmCard key={firearm.id} firearm={firearm} />
        ))}
      </div>
      {/* TODO: Accessory affiliate links */}
      {/* TODO: Country-specific legality filters */}
      {/* TODO: Comparison view by fire rate, weight, etc. */}
    </div>
  );
};

export default FirearmsPage;
