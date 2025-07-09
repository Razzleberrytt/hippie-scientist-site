
import React from 'react';
import type { Herb } from '../data/herbs.refactored';

interface SearchFilterProps {
  onCategoryChange: (category: string) => void;
  onEffectChange: (effect: string) => void;
  herbs: Herb[];
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onCategoryChange, onEffectChange, herbs }) => {
  const categories = Array.from(new Set(herbs.map(h => h.category)));
  const effects = Array.from(new Set(herbs.flatMap(h => h.effects)));

  return (
    <div className="space-y-4">
      <select onChange={e => onCategoryChange(e.target.value)} className="w-full rounded p-2">
        <option value="">All Categories</option>
        {categories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select onChange={e => onEffectChange(e.target.value)} className="w-full rounded p-2">
        <option value="">All Effects</option>
        {effects.map(effect => (
          <option key={effect} value={effect}>
            {effect}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchFilter;
