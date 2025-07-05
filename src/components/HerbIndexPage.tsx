// src/components/HerbIndex.tsx
import React, { useState, useMemo } from 'react';
import herbsData from '../data/herbs.json';
import './HerbIndex.css';

export interface HerbEntry {
  id: string;
  name: string;
  thcaPct?: number;
  thcPct?: number;
  cbdPct?: number;
  coaUrl?: string;
  brand?: string;
  // add any other fields you need here
}

export const HerbIndex: React.FC = () => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'thcaPct' | 'thcPct'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return (herbsData as HerbEntry[])
      .filter((h) => h.name.toLowerCase().includes(term))
      .sort((a, b) => {
        const aVal = a[sortKey] ?? 0;
        const bVal = b[sortKey] ?? 0;
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [search, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="herb-index">
      <h1>Herb COA Index</h1>

      <div className="herb-index__controls">
        <input
          type="text"
          placeholder="Search by strain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="herb-index__sort">
          <button
            className={sortKey === 'name' ? 'active' : ''}
            onClick={() => toggleSort('name')}
          >
            Name {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
          </button>
          <button
            className={sortKey === 'thcaPct' ? 'active' : ''}
            onClick={() => toggleSort('thcaPct')}
          >
            THCA % {sortKey === 'thcaPct' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
          </button>
          <button
            className={sortKey === 'thcPct' ? 'active' : ''}
            onClick={() => toggleSort('thcPct')}
          >
            THC % {sortKey === 'thcPct' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
          </button>
        </div>
      </div>

      <table className="herb-index__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>THCA %</th>
            <th>Δ⁹-THC %</th>
            <th>CBD %</th>
            <th>COA</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((h) => (
            <tr key={h.id}>
              <td>{h.name}</td>
              <td>{h.brand || '–'}</td>
              <td>{h.thcaPct != null ? h.thcaPct.toFixed(2) : '–'}</td>
              <td>{h.thcPct != null ? h.thcPct.toFixed(2) : '–'}</td>
              <td>{h.cbdPct != null ? h.cbdPct.toFixed(2) : '–'}</td>
              <td>
                {h.coaUrl ? (
                  <a href={h.coaUrl} target="_blank" rel="noopener noreferrer">
                    View PDF
                  </a>
                ) : (
                  '–'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HerbIndex;
