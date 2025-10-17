import React from 'react'
import EntityDatabasePage from '@/components/EntityDatabasePage'
import type { Herb } from '@/types'
import { decorateHerbs } from '@/lib/herbs'
import { ENABLE_ADVANCED_FILTERS } from '@/config/ui'
import { useCounters } from '@/lib/counters'
import { loadHerbData } from '@/lib/herb-data'

export default function HerbsPage() {
  const counters = useCounters()
  const [items, setItems] = React.useState<Herb[]>([])

  React.useEffect(() => {
    let alive = true

    loadHerbData()
      .then(data => {
        if (!alive) return
        setItems(decorateHerbs(data))
      })
      .catch(() => {
        if (!alive) return
        setItems([])
      })

    return () => {
      alive = false
    }
  }, [])

  return (
    <EntityDatabasePage
      title='Herb Database'
      description='Search and explore the library.'
      metaPath='/herbs'
      items={items}
      kind='herb'
      counters={counters}
      enableAdvancedFilters={ENABLE_ADVANCED_FILTERS}
    />
  )
}
