import { useState } from 'react';
import HerbCard from './HerbCard';
import type { Herb } from '../types';

interface Props {
  herbs: Herb[];
}

export default function HerbGrid({ herbs }: Props) {
  const [visible, setVisible] = useState(12);
  const toShow = herbs.slice(0, visible);
  const hasMore = visible < herbs.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {toShow.map((herb) => (
          <HerbCard key={herb.id || herb.name} herb={herb} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + 12)}
            className="rounded bg-purple-600 px-4 py-2 text-white"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}
