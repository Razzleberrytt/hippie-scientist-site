type TypeFilterProps = {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

export default function TypeFilter({ label, options, value, onChange }: TypeFilterProps) {
  return (
    <label className='block rounded-2xl border border-white/10 bg-white/[0.03] p-3'>
      <span className='mb-2 block text-sm font-semibold text-white'>{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className='w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400/35'
      >
        <option value='all'>All</option>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
