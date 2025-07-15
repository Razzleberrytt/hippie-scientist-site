import HerbCard from './HerbCard';
import type { Herb } from '../types';

interface Props {
  herbs: Herb[];
}

export default function HerbGrid({ herbs }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {herbs.map((herb) => (
        <HerbCard key={herb.name} herb={herb} />
      ))}
    </div>
  );
}
