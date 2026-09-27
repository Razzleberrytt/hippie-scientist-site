import Link from 'next/link'

export type SafetyFamilySurface = 'checker' | 'guides' | 'learn' | 'checklist'

const safetyItems: Array<{
  id: SafetyFamilySurface
  label: string
  href: string
  description: string
}> = [
  {
    id: 'checker',
    label: 'Check a combination',
    href: '/safety-checker/',
    description: 'Screen a stack for overlapping caution and interaction signals.',
  },
  {
    id: 'guides',
    label: 'Interaction guides',
    href: '/safety-checker/interactions/',
    description: 'Read source-backed reviews for selected supplement and medication-class pairs.',
  },
  {
    id: 'learn',
    label: 'Understand interactions',
    href: '/learn/interactions/',
    description: 'Learn how pathway overlap, stacking, metabolism, and uncertainty affect risk.',
  },
  {
    id: 'checklist',
    label: 'Safety checklist',
    href: '/info/supplement-safety-checklist/',
    description: 'Review medication context, stacking, dose/form, and product-quality checks before buying.',
  },
]

export default function SafetyFamilyNav({ active }: { active: SafetyFamilySurface }) {
  return (
    <nav
      aria-label='Safety research options'
      className='rounded-2xl border border-brand-900/10 bg-white/80 p-3 shadow-sm'
    >
      <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
        {safetyItems.map((item) => {
          const isActive = item.id === active
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'rounded-xl border border-brand-700/20 bg-brand-50 p-4'
                  : 'rounded-xl border border-transparent p-4 transition hover:border-brand-900/10 hover:bg-brand-50/40'
              }
            >
              <span className='block text-sm font-bold text-ink'>{item.label}</span>
              <span className='mt-1 block text-xs leading-5 text-muted'>{item.description}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
