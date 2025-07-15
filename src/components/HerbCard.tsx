import React from 'react';
import type { Herb } from '../types/Herb';

interface HerbCardProps {
  herb: Herb;
}

export function HerbCard({ herb }: HerbCardProps) {
  return (
    <div className="herb-card">
      <h2 className="herb-card__name">{herb.name}</h2>
      <p className="herb-card__description">
        {herb.description || "No description available."}
      </p>
      <p>{herb.effects.join(', ') || "No effects listed."}</p>
      <p>{herb.mechanismOfAction || "No known mechanism."}</p>
      <p>{herb.toxicityLD50 || "Toxicity unknown."}</p>
    </div>
  );
}
