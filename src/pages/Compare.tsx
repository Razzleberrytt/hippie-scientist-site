import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { useHerbs } from '../hooks/useHerbs'
import TagBadge from '../components/TagBadge'
import { decodeTag } from '../utils/format'

export default function Compare() {
  const [params] = useSearchParams()
  const herbParam = params.get('herb')
  const compound = params.get('compound')
  const herbs = useHerbs()
  const herbInfo = herbParam ? herbs.find(h => h.id === herbParam) : undefined
  const name = herbInfo?.name || compound || herbParam || 'Item'
  const tags = herbInfo?.tags || []
  const products = herbInfo?.affiliateLink
    ? [herbInfo.affiliateLink]
    : []

  return (
    <>
      <Helmet>
        <title>Compare - The Hippie Scientist</title>
      </Helmet>
      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-3xl'>
          <h1 className='text-gradient mb-6 text-center text-5xl font-bold'>Comparison</h1>
          <div className='glass-card p-6 text-center'>
            <h2 className='mb-2 text-2xl font-bold'>{name}</h2>
            {tags.length > 0 && (
              <div className='mb-4 flex flex-wrap justify-center gap-2'>
                {tags.map(t => (
                  <TagBadge key={t} label={decodeTag(t)} />
                ))}
              </div>
            )}
            {herbInfo?.description && (
              <p className='mb-4 text-sand'>{herbInfo.description}</p>
            )}
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
              {products.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover-glow flex h-24 items-center justify-center rounded-lg bg-black/20 p-2 text-sky-300 underline dark:bg-white/10'
                >
                  Buy Online
                </a>
              ))}
              {Array.from({ length: Math.max(0, 3 - products.length) }).map((_, i) => (
                <div key={`p${i}`} className='h-24 rounded-lg bg-black/20 dark:bg-white/10' />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
