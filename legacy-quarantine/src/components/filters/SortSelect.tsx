import type { SortFilter } from '@/utils/filterModel'

type SortSelectProps = {
  value: SortFilter
  onChange: (value: SortFilter) => void
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className='browse-shell block p-3'>
      <span className='section-label mb-2 block'>Sort</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value as SortFilter)}
        className='h-11 w-full appearance-none rounded-xl border border-white/12 bg-white/5 bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2020%2020%27%20fill%3D%27none%27%3E%3Cpath%20d%3D%27M5%207.5L10%2012.5L15%207.5%27%20stroke%3D%27rgba%28255%2C255%2C255%2C0.55%29%27%20stroke-width%3D%271.75%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3C/svg%3E")] bg-[right_0.85rem_center] bg-[length:15px_15px] bg-no-repeat px-4 pr-10 text-sm text-white/80 transition-colors focus:border-[var(--accent-teal)]/50 focus:outline-none focus:ring-0'
      >
        <option value='browse_quality'>Best quality (default)</option>
        <option value='az'>A–Z</option>
        <option value='confidence'>Confidence</option>
        <option value='effects'>Effects count</option>
        <option value='governed_evidence'>Governed evidence strength</option>
        <option value='review_freshness'>Review freshness</option>
        <option value='safety_first'>Safety cautions first</option>
      </select>
    </label>
  )
}
