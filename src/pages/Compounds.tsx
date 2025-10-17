import React from 'react'
import EntityDatabasePage from '@/components/EntityDatabasePage'
import { useCounters } from '@/lib/counters'
import { decorateCompounds } from '@/lib/compounds'

const decoratedCompounds = decorateCompounds()

export default function CompoundsPage() {
  const counters = useCounters()

  return (
    <EntityDatabasePage
      title='Active Compounds'
      description='Search and explore the molecule library.'
      metaPath='/compounds'
      items={decoratedCompounds}
      kind='compound'
      counters={counters}
    />
  )
}
