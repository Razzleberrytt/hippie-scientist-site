import { useEffect, useState } from 'react'
import { loadHerbs, type Entity } from '@/lib/data'
import EntityCard from '@/components/EntityCard'
import Meta from '@/components/Meta'

export default function HerbIndex() {
  const [items, setItems] = useState<Entity[] | null>(null)

  useEffect(() => {
    let active = true
    loadHerbs().then(data => {
      if (active) setItems(data)
    })
    return () => {
      active = false
    }
  }, [])

  if (!items) {
    return <div className='p-6 text-white/70'>Loading herbs…</div>
  }

  return (
    <main className='mx-auto max-w-3xl px-4 pb-24'>
      <Meta
        title='Herb Database Browse | The Hippie Scientist'
        description='Browse herbs in the reference library.'
        path='/browse/herbs'
        noindex
      />
      <header className='pb-6 pt-8'>
        <h1 className='text-3xl font-bold text-white md:text-4xl'>Herb Database</h1>
        <p className='mt-2 text-white/70'>Search and explore the library.</p>
      </header>
      <section className='grid gap-4 md:gap-5'>
        {items.map(entity => (
          <EntityCard key={entity.id} e={{ ...entity, kind: 'herb' }} />
        ))}
      </section>
      {items.length === 0 && <p className='mt-10 text-white/60'>No herbs available.</p>}
    </main>
  )
}
