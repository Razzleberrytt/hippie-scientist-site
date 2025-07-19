import React from 'react'
import { Helmet } from 'react-helmet-async'
import { herbs } from '../data/herbs'
import baseCompounds, { CompoundInfo } from '../data/compoundData'
import { FlaskConical, Leaf, Gem, Droplet } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { slugify } from '../utils/slugify'

interface Compound extends CompoundInfo {
  sources: { id: string; name: string; link?: string }[]
}

function typeIcon(type: string) {
  const t = type.toLowerCase()
  if (t.includes('alkaloid')) return <FlaskConical className='mr-1 inline h-4 w-4' />
  if (t.includes('terpene')) return <Leaf className='mr-1 inline h-4 w-4' />
  if (t.includes('glycoside')) return <Gem className='mr-1 inline h-4 w-4' />
  if (t.includes('phenolic') || t.includes('coumarin'))
    return <Droplet className='mr-1 inline h-4 w-4' />
  return null
}

export default function Compounds() {
  const [params] = useSearchParams()
  const selected = params.get('compound')

  const [tagFilter, setTagFilter] = React.useState<string[]>([])

  const compounds = React.useMemo(() => {
    const map = new Map<string, Compound>()
    baseCompounds.forEach(c => {
      map.set(c.name, { ...c, sources: [] })
    })
    herbs.forEach(h => {
      h.activeConstituents?.forEach(c => {
        const key = c.name
        if (!map.has(key)) {
          map.set(key, {
            name: c.name,
            type: c.type,
            mechanism: '',
            affiliateLink: undefined,
            sources: [{ id: h.id, name: h.name, link: h.affiliateLink }],
          })
        } else {
          const entry = map.get(key)!
          if (!entry.sources.find(s => s.id === h.id)) {
            entry.sources.push({ id: h.id, name: h.name, link: h.affiliateLink })
          }
        }
      })
    })
    return Array.from(map.values())
  }, [])

  const compoundList = React.useMemo(
    () => [...compounds].sort((a, b) => a.name.localeCompare(b.name)),
    [compounds]
  )

  const allTags = React.useMemo(() => {
    const t = compounds.reduce<string[]>((acc, c) => acc.concat(c.tags || []), [])
    return Array.from(new Set(t))
  }, [compounds])

  const selectedCompound = React.useMemo(
    () => compoundList.find(c => selected && slugify(c.name) === selected) || null,
    [compoundList, selected]
  )

  const filteredList = React.useMemo(() => {
    if (tagFilter.length === 0) return compoundList
    return compoundList.filter(c => c.tags?.some(t => tagFilter.includes(t)))
  }, [compoundList, tagFilter])

  return (
    <>
      <Helmet>
        <title>Psychoactive Compounds - The Hippie Scientist</title>
        <meta
          name='description'
          content='Browse active constituents found in herbs and learn their mechanisms.'
        />
      </Helmet>
      <div className='min-h-screen px-4 pb-12 pt-20'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='text-gradient mb-6 text-5xl font-bold'>Psychoactive Compounds</h1>
          <p className='mb-8 text-sand'>
            Prototype view of active constituents found in the herb database.
          </p>
          {selectedCompound ? (
            <div className='glass-card mb-6 p-4 text-left'>
              <h2 className='text-xl font-bold text-white'>{selectedCompound.name}</h2>
              <p className='text-sm text-moss'>
                {typeIcon(selectedCompound.type)}
                {selectedCompound.type}
              </p>
              {selectedCompound.mechanism && (
                <p className='text-xs text-sand'>MOA: {selectedCompound.mechanism}</p>
              )}
              {selectedCompound.aliases && selectedCompound.aliases.length > 0 && (
                <p className='text-xs text-sand'>
                  Also known as: {selectedCompound.aliases.join(', ')}
                </p>
              )}
              <p className='text-xs text-sand'>
                Herbs:
                {selectedCompound.sources.map((s, i) => (
                  <React.Fragment key={s.id}>
                    {i > 0 && ', '}
                    <Link to={`/herbs/${s.id}`} className='underline'>
                      {s.name}
                    </Link>
                    {s.link && (
                      <a
                        href={s.link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='ml-1 text-sky-300 underline'
                      >
                        Buy
                      </a>
                    )}
                  </React.Fragment>
                ))}
              </p>
              {selectedCompound.affiliateLink && (
                <a
                  href={selectedCompound.affiliateLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-1 inline-block min-h-[44px] text-sm text-sky-300 underline'
                >
                  Buy Online
                </a>
              )}
              <div className='mt-2'>
                <Link to='/compounds' className='text-comet underline'>
                  Back to list
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className='mb-4 flex flex-wrap justify-center gap-2'>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    type='button'
                    onClick={() =>
                      setTagFilter(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )
                    }
                    className={`tag-pill ${tagFilter.includes(tag) ? 'ring-2 ring-emerald-400' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
                {filteredList.map(c => (
                  <div
                    key={c.name}
                    id={slugify(c.name)}
                    className='glass-card flex flex-col p-4 text-left'
                  >
                    <h2 className='max-w-xs truncate text-xl font-bold text-white'>{c.name}</h2>
                    <p className='text-sm text-moss'>
                      {typeIcon(c.type)}
                      {c.type}
                    </p>
                    {c.tags && <p className='mb-1 text-xs text-sand'>Tags: {c.tags.join(', ')}</p>}
                    {c.mechanism && <p className='text-xs text-sand'>MOA: {c.mechanism}</p>}
                    <p className='text-xs text-sand'>
                      Herbs:
                      {c.sources.map((s, i) => (
                        <React.Fragment key={s.id}>
                          {i > 0 && ', '}
                          <Link to={`/herbs/${s.id}`} className='underline'>
                            {s.name}
                          </Link>
                          {s.link && (
                            <a
                              href={s.link}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='ml-1 text-sky-300 underline'
                            >
                              Buy
                            </a>
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                    {c.affiliateLink && (
                      <a
                        href={c.affiliateLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='mt-1 inline-block min-h-[44px] text-sm text-sky-300 underline'
                      >
                        Buy Online
                      </a>
                    )}
                    <Link
                      to={`/compounds?compound=${slugify(c.name)}`}
                      className='mt-1 text-comet underline'
                    >
                      Detail
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
