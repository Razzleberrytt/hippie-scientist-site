import { useMemo, useState } from 'react'
import Meta from '@/components/Meta'
import { Button } from '@/components/ui/Button'
import InteractionReportCard from '@/components/interactions/InteractionReportCard'
import InteractionSearch, {
  type InteractionCatalogItem,
} from '@/components/interactions/InteractionSearch'
import SelectedInteractionItems from '@/components/interactions/SelectedInteractionItems'
import { useCompoundData } from '@/lib/compound-data'
import { useHerbData } from '@/lib/herb-data'
import type { InteractionReport, InteractionSourceItem } from '@/types/interactions'
import { checkInteractions } from '@/utils/interactions/checkInteractions'

function normalizeTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(entry => String(entry).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[;,|]/)
      .map(entry => entry.trim())
      .filter(Boolean)
  }

  return []
}

export default function InteractionsPage() {
  const herbs = useHerbData()
  const compounds = useCompoundData()
  const [selectedItems, setSelectedItems] = useState<InteractionCatalogItem[]>([])
  const [report, setReport] = useState<InteractionReport | null>(null)

  const herbCatalog = useMemo<InteractionCatalogItem[]>(
    () =>
      herbs.map(herb => ({
        id: `herb:${herb.slug}`,
        name: herb.common || herb.scientific || herb.name || herb.slug,
        kind: 'herb',
        category: String(herb.class || herb.category || ''),
        effects: normalizeTextArray(herb.effects),
      })),
    [herbs]
  )

  const compoundCatalog = useMemo<InteractionCatalogItem[]>(
    () =>
      compounds.map(compound => ({
        id: `compound:${compound.slug}`,
        name: compound.name,
        kind: 'compound',
        category: compound.category || compound.className,
        effects: normalizeTextArray(compound.effects),
      })),
    [compounds]
  )

  const catalog = useMemo(
    () => [...herbCatalog, ...compoundCatalog].sort((a, b) => a.name.localeCompare(b.name)),
    [compoundCatalog, herbCatalog]
  )

  const sourceItemMap = useMemo(() => {
    const map = new Map<string, InteractionSourceItem>()

    herbs.forEach(herb => {
      const id = `herb:${herb.slug}`
      map.set(id, {
        id,
        name: herb.common || herb.scientific || herb.name || herb.slug,
        kind: 'herb',
        category: String(herb.class || herb.category || ''),
        mechanism: String(herb.mechanism || herb.mechanismOfAction || ''),
        effects: normalizeTextArray(herb.effects),
        contraindications: normalizeTextArray(herb.contraindications),
        interactions: normalizeTextArray(herb.interactions),
        safety: normalizeTextArray([herb.safety, herb.sideEffects, herb.toxicity]),
        confidence: herb.confidence,
      })
    })

    compounds.forEach(compound => {
      const id = `compound:${compound.slug}`
      map.set(id, {
        id,
        name: compound.name,
        kind: 'compound',
        category: compound.category || compound.className,
        mechanism: compound.mechanism,
        effects: normalizeTextArray(compound.effects),
        contraindications: normalizeTextArray(compound.contraindications),
        interactions: normalizeTextArray(compound.interactions),
        safety: normalizeTextArray(compound.sideEffects),
        confidence: compound.confidence,
      })
    })

    return map
  }, [compounds, herbs])

  const addItem = (item: InteractionCatalogItem) => {
    setSelectedItems(prev => {
      if (prev.some(existing => existing.id === item.id)) return prev
      if (prev.length >= 3) return prev
      return [...prev, item]
    })
  }

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id))
  }

  const runCheck = () => {
    const sourceItems = selectedItems
      .map(item => sourceItemMap.get(item.id))
      .filter((item): item is InteractionSourceItem => Boolean(item))

    setReport(checkInteractions(sourceItems))
  }

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10'>
      <Meta
        title='Interaction Checker | The Hippie Scientist'
        description='Check potential overlap signals between herbs and compounds using structured normalized data.'
        path='/interactions'
      />

      <header className='space-y-2 rounded-2xl border border-white/10 bg-black/35 p-5'>
        <h1 className='text-3xl font-bold text-white sm:text-4xl'>Interaction Checker</h1>
        <p className='max-w-3xl text-sm text-white/80 sm:text-base'>
          Check potential overlap signals between herbs and compounds.
        </p>
      </header>

      <section className='space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5'>
        <InteractionSearch
          items={catalog}
          selectedIds={selectedItems.map(item => item.id)}
          onAddItem={addItem}
          maxSelection={3}
        />

        <SelectedInteractionItems items={selectedItems} onRemove={removeItem} />

        <div className='flex flex-wrap items-center gap-3'>
          <Button
            variant='primary'
            onClick={runCheck}
            disabled={selectedItems.length < 2}
            className='px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Check Interactions
          </Button>
          {selectedItems.length < 2 && (
            <p className='text-sm text-white/65'>Select at least two items to compare.</p>
          )}
        </div>
      </section>

      <InteractionReportCard report={report} />

      <section className='rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80'>
        <h2 className='mb-2 text-base font-semibold text-white'>Important disclaimer</h2>
        <p>
          This harm-reduction tool surfaces possible caution signals from structured data. It is not
          a diagnostic system, and it does not replace clinical guidance.
        </p>
      </section>
    </main>
  )
}
