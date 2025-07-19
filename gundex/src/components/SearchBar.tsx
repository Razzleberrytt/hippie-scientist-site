interface Props {
  query: string;
  setQuery: (q: string) => void;
}

export default function SearchBar({ query, setQuery }: Props) {
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search by name, caliber, type"
      className="w-full p-2 rounded bg-gray-800 text-gray-200 focus:outline-none focus:ring focus:ring-red-500"
    />
  );
}
