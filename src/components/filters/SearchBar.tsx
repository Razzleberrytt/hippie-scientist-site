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
        <div className='relative'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
            className='pointer-events-none absolute left-3.5 top-1/2 size-[15px] -translate-y-1/2 text-white/40'
          >
            <circle cx='11' cy='11' r='8' />
            <path d='m21 21-4.3-4.3' />
          </svg>
          <input
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className='h-11 w-full rounded-xl border border-white/12 bg-white/5 px-4 pl-10 text-sm text-white placeholder:text-white/35 transition-colors focus:border-[var(--accent-teal)]/50 focus:outline-none focus:ring-0'
            aria-label='Search entries'
          />
          {value && (
            <button
              type='button'
              className='absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white'
              onClick={() => onChange('')}
              aria-label='Clear search'
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
