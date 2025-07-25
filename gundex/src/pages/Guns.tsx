import { useState, useMemo } from 'react';
import gunsData from '../data/guns.json';
import Fuse from 'fuse.js';
import GunCardAccordion from '../components/GunCardAccordion';
import SearchBar from '../components/SearchBar';
import TagFilterBar from '../components/TagFilterBar';

const allTags = Array.from(new Set(gunsData.flatMap((g) => g.tags)));

export default function Guns() {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const fuse = useMemo(
    () =>
      new Fuse(gunsData, {
        keys: ['name', 'type', 'caliber'],
        threshold: 0.3,
      }),
    []
  );

  const results = useMemo(() => {
    const base = query ? fuse.search(query).map((r) => r.item) : gunsData;
    if (activeTags.length === 0) return base;
    return base.filter((g) => activeTags.every((t) => g.tags.includes(t)));
  }, [query, activeTags, fuse]);

  const toggleTag = (tag: string) => {
    setActiveTags((curr) =>
      curr.includes(tag) ? curr.filter((t) => t !== tag) : [...curr, tag]
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <SearchBar query={query} setQuery={setQuery} />
      <TagFilterBar tags={allTags} active={activeTags} toggle={toggleTag} />
      {results.length === 0 ? (
        <p className="text-center text-gray-400">No firearms found.</p>
      ) : (
        results.map((gun) => <GunCardAccordion key={gun.name} gun={gun} />)
      )}
    </div>
  );
}
