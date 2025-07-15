import React from 'react';
import type { Herb } from '../types';

interface SearchFilterProps {
  herbs: Herb[];
  onFilter: (filtered: Herb[]) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ herbs, onFilter }) => {
  const [query, setQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    const filtered = herbs.filter((herb) =>
      herb.name.toLowerCase().includes(value.toLowerCase()) ||
      herb.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase()))
    );

    onFilter(filtered);
  };

  return (
    <div className="mb-8">
      <input
        type="text"
        placeholder="Search herbs..."
        value={query}
        onChange={handleSearch}
        className="w-full px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
};

export default SearchFilter;
