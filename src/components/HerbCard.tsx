// src/components/HerbCard.tsx

import type { Herb } from '../types/Herb';

interface HerbCardProps {
  herb: Herb;
}

export function HerbCard({ herb }: HerbCardProps) {
  return (
    <div className="herb-card">
      <h2 className="herb-card__name">{herb.name}</h2>
      <p className="herb-card__description">{herb.description}</p>
    </div>
  );
}
