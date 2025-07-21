import React from 'react'
import { useParams, Link } from 'react-router-dom'
import herbs from '../data/herbs'
import HerbCardAccordion from '../components/HerbCardAccordion'
import ErrorBoundary from '../components/ErrorBoundary'
import { slugify } from '../utils/slugify'

export default function HerbCardPage() {
  const { herbId } = useParams<{ herbId?: string }>();
  const id = herbId?.toLowerCase() || '';
  const herb = React.useMemo(() => {
    return herbs.find(h => {
      const nameSlug = h.name?.toLowerCase().replaceAll(' ', '-')
      const slug = (h as any).slug?.toLowerCase()
      return (
        h.id?.toLowerCase() === id ||
        slug === id ||
        nameSlug === id ||
        slugify(h.name).toLowerCase() === id
      )
    })
  }, [id])

  const notFound = (
    <div className='rounded-md border border-red-500/40 bg-red-500/10 p-6 text-center'>
      <h1 className='text-2xl font-bold text-red-300'>404 – Herb Not Found</h1>
      <Link to='/database' className='text-comet underline'>
        Back to database
      </Link>
    </div>
  )

  const content =
    herb && typeof herb === 'object' && herb.name ? (
      <ErrorBoundary fallback={notFound}>
        <HerbCardAccordion herb={herb} />
      </ErrorBoundary>
    ) : (
      notFound
    )

  return <div className='mx-auto max-w-3xl px-4 py-8'>{content}</div>
}
