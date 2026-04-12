import type { SortFilter } from '@/utils/filterModel'

type SortSelectProps = {
  value: SortFilter
  onChange: (value: SortFilter) => void
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className='block rounded-2xl border border-white/10 bg-white/[0.03] p-3'>
      <span className='mb-2 block text-sm font-semibold text-white'>Sort</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value as SortFilter)}
        className='w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400/35'
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
