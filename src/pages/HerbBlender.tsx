import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BlendSummaryCard from '../components/BlendSummaryCard'
import HerbCardAccordion from '../components/HerbCardAccordion'
import TagBadge from '../components/TagBadge'
import { useHerbs } from '../hooks/useHerbs'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { herbName, splitField } from '../utils/herb'
import SEO from '../components/SEO'

export default function HerbBlender() {
  const herbs = useHerbs()
  const [input, setInput] = React.useState('')
  const [selected, setSelected] = React.useState<string[]>([])
  const [saved, setSaved] = useLocalStorage<string[][]>('savedBlends', [])

  const addHerb = () => {
    const h = herbs.find(
      x => herbName(x).toLowerCase() === input.toLowerCase() || x.id === input
    )
    if (h && !selected.includes(h.id) && selected.length < 5) {
      setSelected(s => [...s, h.id])
    }
    setInput('')
  }

  const removeHerb = (id: string) => setSelected(s => s.filter(x => x !== id))
  const clearAll = () => setSelected([])
  const randomize = () => {
    const ids = herbs.map(h => h.id)
    const count = Math.floor(Math.random() * 4) + 2
    const pick: string[] = []
    while (pick.length < count && ids.length) {
      const i = Math.floor(Math.random() * ids.length)
      pick.push(ids.splice(i, 1)[0])
    }
    setSelected(pick)
  }
  const selectedHerbs = herbs.filter(h => selected.includes(h.id))

  const saveBlend = () => {
    if (selectedHerbs.length >= 2) {
      setSaved(b => [...b, selected])
    }
  }

  const combinedEffects = React.useMemo(
    () =>
      Array.from(
        new Set(selectedHerbs.flatMap(h => splitField(h.effects)))
      ),
    [selectedHerbs]
  )
  const combinedTags = React.useMemo(
    () => Array.from(new Set(selectedHerbs.flatMap(h => splitField(h.tags)))),
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
      <SEO
        title='Herb Blend Builder | The Hippie Scientist'
        description='Combine herbs to explore synergies and craft mindful blends.'
        canonical='https://thehippiescientist.net/blend'
      />
      <div className='mx-auto max-w-6xl space-y-6'>
        <motion.h1
          className='text-gradient text-center text-5xl font-bold'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Herb Blend Builder
        </motion.h1>
        <div className='flex flex-wrap items-center gap-2'>
          <input
            list='herb-list'
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Type herb name'
            className='rounded-md bg-space-dark/70 px-3 py-2 text-white backdrop-blur-md focus:outline-none'
          />
          <datalist id='herb-list'>
            {herbs.map(h => (
              <option key={h.id} value={herbName(h)} />
            ))}
          </datalist>
          <button
            type='button'
            onClick={addHerb}
            className='tag-pill hover-glow bg-emerald-700/70 text-white'
          >
            Add Herb
          </button>
          <button
            type='button'
            onClick={clearAll}
            className='tag-pill hover-glow bg-rose-700/70 text-white'
          >
            Clear
          </button>
          <button
            type='button'
            onClick={randomize}
            className='tag-pill hover-glow bg-sky-700/70 text-white'
          >
            Randomize
          </button>
        </div>
        <div className='flex flex-wrap gap-2'>
          {selectedHerbs.map(h => (
            <button
              key={h.id}
              type='button'
              onClick={() => removeHerb(h.id)}
              className='tag-pill ring-2 ring-emerald-400'
            >
              {herbName(h)}
            </button>
          ))}
        </div>
        <BlendSummaryCard herbs={selectedHerbs} onSave={saveBlend} />
        {combinedEffects.length > 0 && (
          <div className='space-y-1 text-sand'>
            <p>
              <strong>Effects:</strong> {combinedEffects.join(', ')}
            </p>
            <p>
              <strong>Categories:</strong> {categories.join(', ')}
            </p>
            <p>
              <strong>Contraindications:</strong> {contraindications || 'None'}
            </p>
            {combinedTags.length > 0 && (
              <div className='flex flex-wrap gap-1'>
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
              key={h.id}
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
