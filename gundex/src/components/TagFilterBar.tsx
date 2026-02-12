interface Props {
  tags: string[];
  active: string[];
  toggle: (tag: string) => void;
}

export default function TagFilterBar({ tags, active, toggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2 my-4">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggle(tag)}
          className={`px-2 py-1 rounded-full text-xs border transition-colors ${
            active.includes(tag)
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
