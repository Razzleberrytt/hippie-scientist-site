import Link from 'next/link'

export type LookupFamilySurface = 'herbs' | 'compounds' | 'search' | 'evidence'

const lookupItems: Array<{
  id: LookupFamilySurface
  label: string
  href: string
  description: string
  owner?: string
}> = [
  {
    id: 'herbs',
    label: 'Herbs',
    href: '/herbs/',
    description: 'Browse botanical profiles and filter by use, evidence, or mechanism.',
  },
  {
    id: 'compounds',
    label: 'Compounds',
    href: '/compounds/',
    description: 'Browse nutrients, molecules, extracts, and active constituents.',
  },
  {
    id: 'search',
    label: 'Search',
    href: '/search/',
    description: 'Search profiles and educational content by name, goal, mechanism, or safety context.',
  },
  {
    id: 'evidence',
    label: 'Evidence strength',
    href: '/evidence/evidence-checker/',
    description: 'Filter compounds by clinical evidence tier.',
    owner: 'Research',
  },
]

export default function LookupFamilyNav({ active }: { active: LookupFamilySurface }) {
  return (
    <nav
      aria-label='Ingredient lookup options'
      className='rounded-2xl border border-brand-900/10 bg-white/80 p-2 shadow-sm sm:p-3'
    >
      <div className='grid grid-cols-2 gap-2 lg:grid-cols-4'>
        {lookupItems.map((item) => {
          const isActive = item.id === active
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'min-h-14 rounded-xl border border-brand-700/20 bg-brand-50 p-3 sm:p-4'
                  : 'min-h-14 rounded-xl border border-transparent p-3 transition hover:border-brand-900/10 hover:bg-brand-50/40 sm:p-4'
              }
            >
              <span className='flex items-center gap-2 text-sm font-bold text-ink'>
                {item.label}
                {item.owner ? (
                  <span className='hidden rounded-full border border-brand-900/10 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-muted sm:inline-flex'>
                    {item.owner}
                  </span>
                ) : null}
              </span>
              <span className='mt-1 hidden text-xs leading-5 text-muted sm:block'>{item.description}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
