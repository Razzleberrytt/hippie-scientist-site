import React from 'react';
import type { Herb } from '../types';
import { herbs } from '../data/herbs/herbsfull'; // Import full herb list here

export function useHerbs(): Herb[] {
  const [herbList] = React.useState<Herb[]>(() => {
    // Map to ensure unique herbs by ID
    const map = new Map<string, Herb>();
    herbs.forEach(h => {
      if (!map.has(h.id)) map.set(h.id, h);
    });
    return Array.from(map.values());
  });

  // Optional development warnings about missing herb data
  React.useEffect(() => {
    if (!import.meta.env.DEV) return;

    herbs.forEach(h => {
      const missing: string[] = [];
      if (!h.affiliateLink) missing.push('affiliateLink');
      if (!h.activeConstituents?.length) missing.push('activeConstituents');
      if (!h.mechanismOfAction) missing.push('mechanismOfAction');
      if (missing.length) {
        console.warn(`${h.name} missing: ${missing.join(', ')}`);
      }
    });
  }, []);

  return herbList;
}
