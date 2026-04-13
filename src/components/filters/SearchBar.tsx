import type { ChangeEvent } from 'react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export default function SearchBar({ value, onChange, placeholder, className = '' }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <div className={`sticky top-2 z-20 ${className}`}>
      <div className='rounded-xl border border-white/12 bg-black/30 p-2'>
        <div className='mb-1 px-1 text-[11px] font-medium uppercase tracking-wide text-white/55'>Search</div>
        <div className='flex items-center gap-2'>
          <input
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className='w-full rounded-lg border border-white/12 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-cyan-400/35'
            aria-label='Search entries'
          />
          {value && (
            <button
              type='button'
              className='rounded-lg border border-white/20 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]'
              onClick={() => onChange('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
