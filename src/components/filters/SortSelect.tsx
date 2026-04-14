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
        className='w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400/35'
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
