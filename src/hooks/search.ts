import { useMemo, useState } from 'react';
import { Herb } from '../data/herbs';

interface UseHerbSearchProps {
  herbs: Herb[];
}

export const useHerbSearch = ({ herbs }: UseHerbSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [selectedSafetyRange, setSelectedSafetyRange] = useState<[number, number]>([1, 10]);
  const [sortBy, setSortBy] = useState('name');

  const fuzzyMatch = (text: string, term: string): boolean => {
    if (!term) return true;
    
    const termLower = term.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (textLower.includes(termLower)) return true;
    
    const words = termLower.split(' ');
    const textWords = textLower.split(/\s+/);
    
    return words.every(word =>
      textWords.some(textWord =>
        textWord.includes(word) || word.includes(textWord)
      )
    );
  };

  const getSearchScore = (herb: Herb, term: string): number => {
    if (!term) return 0;
    
    const termLower = term.toLowerCase();
    let score = 0;
    
    if (herb.name.toLowerCase().includes(termLower)) score += 100;
    if (herb.scientificName?.toLowerCase().includes(termLower)) score += 80;
    if (herb.category.toLowerCase().includes(termLower)) score += 60;
    
    herb.effects.forEach(effect => {
      if (effect.toLowerCase().includes(termLower)) score += 40;
    });
    
    if (herb.description.toLowerCase().includes(termLower)) score += 20;
    if (herb.mechanismOfAction.toLowerCase().includes(termLower)) score += 30;
    if (herb.therapeuticUses.toLowerCase().includes(termLower)) score += 25;
    
    return score;
  };

  const filteredHerbs = useMemo(() => {
    let filtered = herbs.filter(herb => {
      if (selectedCategory !== 'All' && herb.category !== selectedCategory) {
        return false;
      }

      if (herb.safetyRating < selectedSafetyRange[0] || herb.safetyRating > selectedSafetyRange[1]) {
        return false;
      }

      if (selectedEffects.length > 0) {
        const hasSelectedEffect = selectedEffects.some(effect =>
          herb.effects.some(herbEffect => 
            herbEffect.toLowerCase().includes(effect.toLowerCase())
          )
        );
        if (!hasSelectedEffect) return false;
      }

      if (searchTerm) {
        const searchableText = [
          herb.name,
          herb.scientificName || '',
          herb.category,
          herb.description,
          herb.mechanismOfAction,
          herb.therapeuticUses,
          ...herb.effects,
          ...herb.tags
        ].join(' ');

        if (!fuzzyMatch(searchableText, searchTerm)) {
          return false;
        }
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (searchTerm) {
        const scoreA = getSearchScore(a, searchTerm);
        const scoreB = getSearchScore(b, searchTerm);
        if (scoreA !== scoreB) return scoreB - scoreA;
      }

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'safety':
          return b.safetyRating - a.safetyRating;
        case 'effects':
          return b.effects.length - a.effects.length;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [herbs, searchTerm, selectedCategory, selectedEffects, selectedSafetyRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedEffects([]);
    setSelectedSafetyRange([1, 10]);
    setSortBy('name');
  };

  return {
    filteredHerbs,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedEffects,
    setSelectedEffects,
    selectedSafetyRange,
    setSelectedSafetyRange,
    sortBy,
    setSortBy,
    totalResults: filteredHerbs.length,
    clearFilters
  };
};
