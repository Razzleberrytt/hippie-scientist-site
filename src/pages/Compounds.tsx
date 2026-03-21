import React from 'react'
import EntityDatabasePage from '@/components/EntityDatabasePage'
import { useCounters } from '@/lib/counters'
import { decorateCompounds } from '@/lib/compounds'

const decoratedCompounds = decorateCompounds()

export default function CompoundsPage() {
  const counters = useCounters()

  return (
    <EntityDatabasePage
      title='Compound Reference'
      description='Explore phytochemicals by class, effects, source herbs, and research relevance.'
      metaPath='/compounds'
      items={decoratedCompounds}
      kind='compound'
      counters={counters}
    />
  )
}
