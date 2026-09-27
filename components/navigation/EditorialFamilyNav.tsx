import Link from 'next/link'

export type EditorialFamilySurface = 'guides' | 'learn' | 'articles'

const editorialItems: Array<{
  id: EditorialFamilySurface
  label: string
  href: string
  description: string
}> = [
  {
    id: 'guides',
    label: 'Guides',
    href: '/guides/',
    description: 'Choose a topic, compare options, or make a practical decision.',
  },
  {
    id: 'learn',
    label: 'Learn',
    href: '/learn/',
    description: 'Understand concepts, mechanisms, neuroscience, and evidence literacy.',
  },
  {
    id: 'articles',
    label: 'Articles',
    href: '/articles/',
    description: 'Read research notes, evidence reviews, updates, and editorial deep dives.',
  },
]

export default function EditorialFamilyNav({ active }: { active: EditorialFamilySurface }) {
  return (
    <nav
      aria-label='Guides, learning, and articles'
      className='rounded-2xl border border-brand-900/10 bg-white/80 p-3 shadow-sm'
    >
      <div className='grid gap-2 sm:grid-cols-3'>
        {editorialItems.map((item) => {
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
