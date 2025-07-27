import React from 'react'
import type { Herb } from '../types'
import { herbs } from '../data/herbs/herbsfull'
import { herbName } from '../utils/herb'

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
      const missing: string[] = []
      if (!h.affiliatelink) missing.push('affiliatelink')
      if (!(Array.isArray(h.activeconstituents) && h.activeconstituents.length))
        missing.push('activeconstituents')
      if (!h.mechanismofaction) missing.push('mechanismofaction')
      if (missing.length) {
        console.warn(`${herbName(h)} missing: ${missing.join(', ')}`)
      }
    })
  }, []);

  return herbList;
}
