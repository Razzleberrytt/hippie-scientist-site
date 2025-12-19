import React from 'react';
import type { Firearm } from '../data/firearms';

interface Props {
  firearm: Firearm;
}

export const FirearmCard: React.FC<Props> = ({ firearm }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4 hover:scale-105 transition-transform">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{firearm.name}</h3>
        <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full">{firearm.type}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{firearm.caliber} • {firearm.origin}</p>
      <p className="mt-2 text-gray-700 dark:text-gray-200">{firearm.description}</p>
    </div>
  );
};

export default FirearmCard;
