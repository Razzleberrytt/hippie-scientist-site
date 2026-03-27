import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useHerbData } from '@/lib/herb-data'
import { decorateCompounds } from '@/lib/compounds'
import posts from '../../public/blogdata/index.json'
import { useSavedItems } from '@/lib/growth'

export default function Favorites() {
  const data = useHerbData()
  const compounds = decorateCompounds()
  const { items, remove } = useSavedItems()

  const savedHerbs = useMemo(
    () => items.filter(entry => entry.type === 'herb').map(entry => entry.slug),
    [items]
  )
  const herbs = useMemo(() => data.filter(h => savedHerbs.includes(h.slug)), [data, savedHerbs])
  const savedCompounds = useMemo(
    () =>
      compounds.filter(item =>
        items.some(entry => entry.type === 'compound' && entry.slug === item.slug)
      ),
    [compounds, items]
  )
  const savedArticles = useMemo(() => {
    const list = Array.isArray(posts) ? posts : []
    return list.filter((post: any) =>
      items.some(entry => entry.type === 'article' && entry.slug === post.slug)
    )
  }, [items])
  const loading = items.length > 0 && data.length === 0

  return (
    <main className='mx-auto max-w-5xl px-4 py-8'>
      <Meta
        title='Saved Items | The Hippie Scientist'
        description='Saved herbs, compounds, and articles.'
        path='/favorites'
        noindex
      />
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Saved items ({items.length})</h1>
      </div>
      {loading ? (
        <p className='opacity-70'>Loading favorites…</p>
      ) : items.length === 0 ? (
        <p className='opacity-70'>You have not saved anything yet.</p>
      ) : (
        <>
          <Section title='Herbs'>
            {herbs.map(h => (
              <SavedCard
                key={`herb-${h.slug}`}
                title={h.common || h.scientific || h.slug}
                description={
                  Array.isArray(h.effects)
                    ? h.effects.join(', ')
                    : (h.effects ?? 'Saved herb profile')
                }
                href={`/herbs/${h.slug}`}
                onRemove={() => remove('herb', h.slug)}
              />
            ))}
          </Section>
          <Section title='Compounds'>
            {savedCompounds.map(c => (
              <SavedCard
                key={`compound-${c.slug}`}
                title={c.common || c.name || c.slug}
                description={
                  Array.isArray(c.effects)
                    ? c.effects.join(', ')
                    : (c.effects ?? 'Saved compound profile')
                }
                href={`/compounds/${c.slug}`}
                onRemove={() => remove('compound', c.slug)}
              />
            ))}
          </Section>
          <Section title='Articles'>
            {savedArticles.map((post: any) => (
              <SavedCard
                key={`article-${post.slug}`}
                title={post.title}
                description={post.description || 'Saved research note'}
                href={`/blog/${post.slug}`}
                onRemove={() => remove('article', post.slug)}
              />
            ))}
          </Section>
        </>
      )}
    </main>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='mt-5'>
      <h2 className='mb-2 text-sm uppercase tracking-[0.14em] text-white/60'>{title}</h2>
      <div className='grid gap-3 sm:grid-cols-2'>{children}</div>
    </section>
  )
}

function SavedCard({
  title,
  description,
  href,
  onRemove,
}: {
  title: string
  description: string
  href: string
  onRemove: () => void
}) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
      <Link to={href} className='text-base font-semibold text-[color:var(--accent)]'>
        {title}
      </Link>
      <p className='mt-2 text-sm text-white/70'>{description}</p>
      <button
        onClick={onRemove}
        className='mt-3 rounded-md border border-white/20 px-2 py-1 text-xs'
      >
        Remove
      </button>
    </div>
  )
}
