import type { ChangeEvent } from 'react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
  className = '',
}: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <div className={`sticky top-2 z-20 ${className}`}>
      <div className='rounded-2xl border border-white/15 bg-black/35 p-2 shadow-[0_0_18px_rgba(168,85,247,0.16)] backdrop-blur'>
        <div className='flex items-center gap-2'>
          <input
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className='w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-violet-400/40'
            aria-label='Search entries'
          />
          {value && (
            <button
              type='button'
              className='rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/10'
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
