import HerbCard from './HerbCard';
import type { Herb } from '../types';
import data from '../data/herbs.json';

const herbs = data as Herb[];

export default function HerbGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {herbs.map((herb) => (
        <HerbCard key={herb.id || herb.name} herb={herb} />
      ))}
    </div>
  );
}
