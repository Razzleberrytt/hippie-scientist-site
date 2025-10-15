// src/pages/HerbDetailPage.tsx
import React from 'react'
import { useParams } from 'react-router-dom'
import { herbs } from '../data/herbs/herbsfull' // Adjust path if needed
import HerbCardAccordion from '../components/HerbCardAccordion'
import ErrorBoundary from '../components/ErrorBoundary'
import { herbName } from '../utils/herb'

export default function HerbDetailPage() {
  const { herbId } = useParams()

  const herb = herbs.find(
    h => h.slug === herbId || h.nameNorm?.toLowerCase().replace(/\s+/g, '-') === herbId
  )

  const isValid = herb && typeof herb === 'object'

  return (
    <div className='mx-auto max-w-3xl p-4'>
      <h1 className='mb-6 text-3xl font-bold text-white'>
        {isValid ? herbName(herb) : 'Herb not found'}
      </h1>
      <ErrorBoundary>
        {isValid ? (
          <HerbCardAccordion herb={herb} />
        ) : (
          <div className='rounded border border-red-400 bg-red-100 p-4 text-center text-red-600 shadow'>
            <p className='mt-2 text-sm text-red-800'>This herb entry is missing or malformed.</p>
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}
