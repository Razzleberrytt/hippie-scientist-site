import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useHerbsFull } from '../data/herbs/herbsfull'
import HerbCardAccordion from '../components/HerbCardAccordion'
import ErrorBoundary from '../components/ErrorBoundary'
import { slugify } from '../utils/slugify'

export default function HerbCardPage() {
  const { herbId } = useParams<{ herbId?: string }>()
  const herbs = useHerbsFull()
  const id = herbId?.toLowerCase() || ''
  const herb = React.useMemo(() => {
    return herbs.find(h => {
      const nameSlug = h.nameNorm?.toLowerCase().replaceAll(' ', '-')
      const slug = (h as any).slug?.toLowerCase()
      return (
        h.id?.toLowerCase() === id ||
        slug === id ||
        nameSlug === id ||
        slugify(h.nameNorm || h.id).toLowerCase() === id
      )
    })
  }, [herbs, id])

  const notFound = (
    <div className='rounded-md border border-red-500/40 bg-red-500/10 p-6 text-center'>
      <h1 className='text-2xl font-bold text-red-300'>404 – Herb Not Found</h1>
      <Link to='/herbs' className='text-comet underline'>
        Back to database
      </Link>
    </div>
  )

  if (!herbs.length) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-8'>
        <div className='text-sand text-center'>Loading herb details…</div>
      </div>
    )
  }

  if (!herb || typeof herb !== 'object') {
    return <div className='mx-auto max-w-3xl px-4 py-8'>{notFound}</div>
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <ErrorBoundary fallback={notFound}>
        <HerbCardAccordion herb={herb} />
      </ErrorBoundary>
    </div>
  )
}
