import { useState, useRef, useEffect } from 'react';
import HerbCard from './HerbCard';
import type { Herb } from '../types';

interface Props {
  herbs: Herb[];
}

export default function HerbGrid({ herbs }: Props) {
  const [visible, setVisible] = useState(12);
  const loadRef = useRef<HTMLDivElement | null>(null);
  const toShow = herbs.slice(0, visible);
  const hasMore = visible < herbs.length;

  useEffect(() => {
    if (!hasMore) return;
    const ob = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisible(v => Math.min(v + 12, herbs.length));
      }
    });
    if (loadRef.current) ob.observe(loadRef.current);
    return () => ob.disconnect();
  }, [hasMore, herbs.length]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {toShow.map((herb) => (
          <HerbCard key={herb.id || herb.name} herb={herb} />
        ))}
      </div>
      {hasMore && (
        <div ref={loadRef} className="py-6 text-center text-gray-400">
          Loading more...
        </div>
      )}
    </>
  );
}
