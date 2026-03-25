import React from 'react'
import { motion, AnimatePresence } from '@/lib/motion'
import type { MotionProps } from '@/lib/motion'
import BlendSummaryCard from '../components/BlendSummaryCard'
import HerbCardAccordion from '../components/HerbCardAccordion'
import TagBadge from '../components/TagBadge'
import { Button } from '@/components/ui/Button'
import { useHerbs } from '../hooks/useHerbs'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { herbName, splitField } from '../utils/herb'
import Meta from '../components/Meta'

type MotionH1Props = React.HTMLAttributes<HTMLHeadingElement> & MotionProps
const MotionH1 = motion.h1 as React.ComponentType<MotionH1Props>

export default function HerbBlender() {
  const herbs = useHerbs()
  const [input, setInput] = React.useState('')
  const [selected, setSelected] = React.useState<string[]>([])
  const [saved, setSaved] = useLocalStorage<string[][]>('savedBlends', [])

  const herbId = (id: string | undefined): string => id ?? ''

  const addHerb = () => {
    const h = herbs.find(x => herbName(x).toLowerCase() === input.toLowerCase() || x.id === input)
    const id = herbId(h?.id)
    if (id && !selected.includes(id) && selected.length < 5) {
      setSelected(s => [...s, id])
    }
    setInput('')
  }

  const removeHerb = (id: string) => setSelected(s => s.filter(x => x !== id))
  const clearAll = () => setSelected([])
  const randomize = () => {
    const ids = herbs.map(h => herbId(h.id)).filter(Boolean)
    const count = Math.floor(Math.random() * 4) + 2
    const pick: string[] = []
    while (pick.length < count && ids.length) {
      const i = Math.floor(Math.random() * ids.length)
      const [nextId] = ids.splice(i, 1)
      if (nextId) pick.push(nextId)
    }
    setSelected(pick)
  }
  const selectedHerbs = herbs.filter(h => selected.includes(herbId(h.id)))

  const saveBlend = () => {
    if (selectedHerbs.length >= 2) {
      setSaved(b => [...b, selected])
    }
  }

  const combinedEffects = React.useMemo(
    () => Array.from(new Set(selectedHerbs.flatMap(h => splitField(h.effects)))),
    [selectedHerbs]
  )
  const combinedTags = React.useMemo(
    () => Array.from(new Set(selectedHerbs.flatMap(h => splitField(h.tags)))).slice(0, 4),
    [selectedHerbs]
  )
  const categories = React.useMemo(
    () => Array.from(new Set(selectedHerbs.map(h => h.category))),
    [selectedHerbs]
  )
  const contraindications = React.useMemo(
    () =>
      selectedHerbs
        .map(h => h.contraindications)
        .filter(Boolean)
        .join(' '),
    [selectedHerbs]
  )

  return (
    <div className='relative min-h-screen px-4 pt-20'>
      <Meta
        title='Herb Blend Builder | The Hippie Scientist'
        description='Combine herbs to explore synergies and craft mindful blends.'
        path='/blend'
      />
      <div className='mx-auto max-w-6xl space-y-6'>
        <MotionH1
          className='gradient-text text-center text-5xl font-bold'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Herb Blend Builder
        </MotionH1>
        <div className='ds-card-lg ds-stack'>
          <div className='flex flex-wrap items-center gap-3'>
            <input
              list='herb-list'
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Type herb name'
              className='min-w-[220px] flex-1 rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/30'
            />
            <datalist id='herb-list'>
              {herbs.map(h => (
                <option key={h.id} value={herbName(h)} />
              ))}
            </datalist>
            <Button type='button' variant='primary' onClick={addHerb}>
              Add Herb
            </Button>
            <Button type='button' variant='secondary' onClick={clearAll}>
              Clear
            </Button>
            <Button type='button' variant='secondary' onClick={randomize}>
              Randomize
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {selectedHerbs.map(h => (
              <button
                key={herbId(h.id) || herbName(h)}
                type='button'
                onClick={() => {
                  const id = herbId(h.id)
                  if (id) removeHerb(id)
                }}
                className='ds-pill border-emerald-300/35 text-white/90'
              >
                {herbName(h)}
              </button>
            ))}
          </div>
        </div>
        <BlendSummaryCard herbs={selectedHerbs} onSave={saveBlend} />
        {combinedEffects.length > 0 && (
          <div className='ds-card ds-stack text-white/80'>
            <p className='leading-7'>
              <strong>Effects:</strong> {combinedEffects.join(', ')}
            </p>
            <p className='leading-7'>
              <strong>Categories:</strong> {categories.join(', ')}
            </p>
            <p className='leading-7'>
              <strong>Contraindications:</strong> {contraindications || 'None'}
            </p>
            {combinedTags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {combinedTags.map(t => (
                  <TagBadge key={t} label={t} />
                ))}
              </div>
            )}
          </div>
        )}
        <AnimatePresence>
          {selectedHerbs.map(h => (
            <motion.div
              key={herbId(h.id) || herbName(h)}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HerbCardAccordion herb={h} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
