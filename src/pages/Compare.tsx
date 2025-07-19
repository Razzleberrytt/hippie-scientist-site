import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams, Link } from 'react-router-dom'
import { useHerbs } from '../hooks/useHerbs'
import baseCompounds, { CompoundInfo } from '../data/compoundData'
import TagBadge from '../components/TagBadge'
import { decodeTag } from '../utils/format'
import { slugify } from '../utils/slugify'
import ProductCard from '../components/ProductCard'
import compareData from '../data/compareData'

export default function Compare() {
  const [params] = useSearchParams()
  const herbsParam = params.get('herbs')
  const compoundsParam = params.get('compounds')
  const herbIds = herbsParam ? herbsParam.split(',').map(s => s.trim()) : []
  const compoundNames = compoundsParam ? compoundsParam.split(',').map(s => s.trim()) : []

  const herbs = useHerbs()

  const herbList = React.useMemo(
    () => herbIds.map(id => herbs.find(h => h.id === id)).filter(Boolean),
    [herbIds, herbs]
  )

  const compoundList = React.useMemo(() => {
    return compoundNames
      .map(n => baseCompounds.find(c => slugify(c.name) === slugify(n)))
      .filter(Boolean) as CompoundInfo[]
  }, [compoundNames])

  const items = React.useMemo(
    () => [
      ...herbList.map(h => ({ type: 'herb' as const, herb: h })),
      ...compoundList.map(c => ({ type: 'compound' as const, compound: c })),
    ],
    [herbList, compoundList]
  )

  const compareRows = React.useMemo(() => {
    return [
      {
        label: 'Name',
        value: (i: typeof items[number]) =>
          i.type === 'herb' ? i.herb?.name : i.compound?.name,
      },
      {
        label: 'Effects',
        value: (i: typeof items[number]) =>
          i.type === 'herb'
            ? (i.herb?.effects || []).join(', ')
            : (i.compound?.tags || []).join(', '),
      },
      {
        label: 'Safety',
        value: (i: typeof items[number]) =>
          i.type === 'herb' ? i.herb?.safetyRating ?? '' : '',
      },
      {
        label: 'Active Constituents',
        value: (i: typeof items[number]) => {
          if (i.type === 'herb') {
            return (i.herb?.activeConstituents || [])
              .map(c => c.name)
              .join(', ')
          }
          return (i.compound?.sourceHerbs || [])
            .map(hid => herbs.find(h => h.id === hid)?.name || hid)
            .join(', ')
        },
      },
    ]
  }, [herbs])

  const productsFor = (key: string) => compareData[key] || []

  const renderCard = (item: { type: 'herb' | 'compound'; herb?: any; compound?: CompoundInfo }) => {
    if (item.type === 'herb' && item.herb) {
      const h = item.herb
      const prods = productsFor(h.id)
      return (
        <div key={h.id} className='glass-card flex min-w-[260px] flex-col gap-2 p-4'>
          <h2 className='text-lg font-bold text-white'>{h.name}</h2>
          {h.tags && (
            <div className='flex flex-wrap gap-1'>
              {h.tags.map((t: string) => (
                <TagBadge key={t} label={decodeTag(t)} />
              ))}
            </div>
          )}
          {h.effects && <p className='text-xs text-sand'>Effects: {h.effects.join(', ')}</p>}
          {h.mechanismOfAction && <p className='text-xs text-sand'>MOA: {h.mechanismOfAction}</p>}
          {h.preparation && <p className='text-xs text-sand'>Prep: {h.preparation}</p>}
          {h.safetyRating && <p className='text-xs text-sand'>Safety: {h.safetyRating}</p>}
          {h.activeConstituents?.length > 0 && (
            <p className='text-xs text-sand'>
              Compounds:{' '}
              {h.activeConstituents.map((c: any, i: number) => (
                <React.Fragment key={c.name}>
                  {i > 0 && ', '}
                  <Link to={`/compounds?compound=${slugify(c.name)}`} className='underline'>
                    {c.name}
                  </Link>
                </React.Fragment>
              ))}
            </p>
          )}
          <div className='mt-auto flex gap-2 overflow-x-auto pb-1'>
            {h.affiliateLink && <ProductCard title={h.name} link={h.affiliateLink} />}
            {prods.map(p => (
              <ProductCard key={p.link} {...p} />
            ))}
          </div>
        </div>
      )
    }
    if (item.type === 'compound' && item.compound) {
      const c = item.compound
      const key = slugify(c.name)
      const prods = productsFor(key)
      return (
        <div key={c.name} className='glass-card flex min-w-[260px] flex-col gap-2 p-4'>
          <h2 className='text-lg font-bold text-white'>{c.name}</h2>
          {c.tags && (
            <div className='flex flex-wrap gap-1'>
              {c.tags.map(t => (
                <TagBadge key={t} label={decodeTag(t)} />
              ))}
            </div>
          )}
          {c.mechanism && <p className='text-xs text-sand'>MOA: {c.mechanism}</p>}
          {c.sourceHerbs && c.sourceHerbs.length > 0 && (
            <p className='text-xs text-sand'>
              Herbs:{' '}
              {c.sourceHerbs.map((hid, i) => {
                const herb = herbs.find(h => h.id === hid)
                return (
                  <React.Fragment key={hid}>
                    {i > 0 && ', '}
                    {herb ? (
                      <Link to={`/herbs/${herb.id}`} className='underline'>
                        {herb.name}
                      </Link>
                    ) : (
                      hid
                    )}
                    {herb?.affiliateLink && (
                      <a
                        href={herb.affiliateLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='ml-1 text-sky-300 underline'
                      >
                        Buy Herb
                      </a>
                    )}
                  </React.Fragment>
                )
              })}
            </p>
          )}
          <div className='mt-auto flex gap-2 overflow-x-auto pb-1'>
            {c.affiliateLink && <ProductCard title={c.name} link={c.affiliateLink} />}
            {prods.map(p => (
              <ProductCard key={p.link} {...p} />
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <Helmet>
        <title>Compare - The Hippie Scientist</title>
      </Helmet>
      <div className='min-h-screen px-4 pt-20'>
        <h1 className='text-gradient mb-6 text-center text-5xl font-bold'>Comparison</h1>
        {items.length > 0 ? (
          <>
            <div className='overflow-x-auto'>
              <table className='glass-card w-full table-auto text-sm'>
                <thead>
                  <tr>
                    <th className='p-2 text-left'>Field</th>
                    {items.map(it => (
                      <th key={it.type === 'herb' ? it.herb!.id : slugify(it.compound!.name)} className='p-2 text-left'>
                        {it.type === 'herb' ? it.herb!.name : it.compound!.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map(row => (
                    <tr key={row.label} className='border-t border-white/20'>
                      <td className='p-2 font-semibold text-lime-300'>{row.label}</td>
                      {items.map(it => (
                        <td key={row.label + (it.type === 'herb' ? it.herb!.id : it.compound!.name)} className='p-2'>
                          {row.value(it) || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2 className='mt-6 text-xl font-bold text-white'>Products</h2>
            <div className='mt-2 grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
              {items.map(renderCard)}
            </div>
          </>
        ) : (
          <p className='text-sand'>Add ?herbs=id1,id2 or ?compounds=name1,name2</p>
        )}
      </div>
    </>
  )
}
