import React from 'react';
import type { Herb } from '../types';
import { decodeTag } from '../utils/format';

interface SearchFilterProps {
  herbs: Herb[];
  onFilter: (filtered: Herb[]) => void;
}

type SortKey = '' | 'intensity' | 'onset' | 'safetyRating';

const SearchFilter: React.FC<SearchFilterProps> = ({ herbs, onFilter }) => {
  const [query, setQuery] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<SortKey>('');

  const allTags = React.useMemo(() => {
    const tags = herbs.reduce((acc: string[], h: Herb) => acc.concat(h.tags), []);
    return Array.from(new Set(tags));
  }, [herbs]);

  const handleAddTag = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !selectedTags.includes(value)) {
      setSelectedTags((t) => [...t, value]);
    }
    e.target.value = '';
  };

  const removeTag = (tag: string) => {
    setSelectedTags((tags) => tags.filter((t) => t !== tag));
  };

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    let res = herbs.filter((h: Herb) => {
      if (q) {
        const nameMatch = h.name.toLowerCase().includes(q) ||
          (h.scientificName ?? '').toLowerCase().includes(q) ||
          h.tags.some((t) => decodeTag(t).toLowerCase().includes(q));
        if (!nameMatch) return false;
      }

      if (selectedTags.length && !selectedTags.every((t) => h.tags.includes(t))) {
        return false;
      }

      return true;
    });

    if (sort === 'intensity') {
      res = [...res].sort((a, b) => a.intensity.localeCompare(b.intensity));
    } else if (sort === 'onset') {
      res = [...res].sort((a, b) => a.onset.localeCompare(b.onset));
    } else if (sort === 'safetyRating') {
      res = [...res].sort(
        (a, b) => (a.safetyRating ?? 0) - (b.safetyRating ?? 0)
      );
    }

    return res;
  }, [herbs, query, selectedTags, sort]);

  React.useEffect(() => {
    onFilter(filtered);
  }, [filtered, onFilter]);

  return (
    <div className="sticky top-2 z-10 mb-8 space-y-4 rounded-lg bg-space-dark/70 p-4 backdrop-blur-md">
      <input
        type="text"
        placeholder="Search herbs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-gray-700 bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <div className="flex flex-wrap items-center gap-2">
        {selectedTags.map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => removeTag(tag)}
            className="tag-pill"
          >
            {decodeTag(tag)}
          </button>
        ))}
        <select
          onChange={handleAddTag}
          className="rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-white"
          defaultValue=""
        >
          <option value="">Add Tag Filter...</option>
          {allTags.map((tag: string) => (
            <option key={tag} value={tag}>
              {decodeTag(tag)}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-white"
        >
          <option value="">Sort By...</option>
          <option value="intensity">Intensity</option>
          <option value="onset">Onset</option>
          <option value="safetyRating">Safety</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;
