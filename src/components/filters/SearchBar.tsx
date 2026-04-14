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
      <div className='browse-shell p-3'>
        <div className='section-label mb-1 px-1'>Search archive</div>
        <div className='flex items-center gap-2'>
          <input
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className='w-full rounded-xl border border-white/20 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-cyan-400/40'
            aria-label='Search entries'
          />
          {value && (
            <button
              type='button'
              className='btn-secondary px-3 py-2 text-xs'
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
