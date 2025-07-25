import React from 'react'
import type { Herb } from '../types'
import TagBadge from './TagBadge'

interface Props {
  herbs: Herb[]
  onSave?: () => void
}

function generateName(herbs: Herb[]): string {
  if (herbs.length === 0) return 'Your Custom Blend'
  const parts = herbs.map(h => h.name.split(' ')[0])
  return parts.join(' ') + ' Fusion'
}

function generateSummary(herbs: Herb[]): string {
  if (!herbs.length) return 'Select herbs to see a summary of the blend.'
  const names = herbs.map(h => h.name).join(', ')
  const effects = Array.from(
    new Set(herbs.flatMap(h => h.effects || []))
  ).join(', ')
  return `Combines ${names} for effects including ${effects}.`
}

export default function BlendSummaryCard({ herbs, onSave }: Props) {
  const name = React.useMemo(() => generateName(herbs), [herbs])
  const summary = React.useMemo(() => generateSummary(herbs), [herbs])
  const tags = React.useMemo(() => {
    return Array.from(new Set(herbs.flatMap(h => h.tags || [])))
  }, [herbs])

  return (
    <div className='soft-border-glow bg-psychedelic-gradient/30 rounded-xl p-4 text-white backdrop-blur-md'>
      <h2 className='mb-2 text-2xl font-bold'>{name}</h2>
      <p className='mb-2 text-sand'>{summary}</p>
      <div className='flex flex-wrap gap-1 mb-2'>
        {tags.map(tag => (
          <TagBadge key={tag} label={tag} />
        ))}
      </div>
      {herbs.length >= 2 && (
        <button
          type='button'
          onClick={onSave}
          className='rounded-md bg-space-dark/70 px-3 py-1 text-sm text-sand backdrop-blur-md hover:bg-white/10'
        >
          Save Blend
        </button>
      )}
    </div>
  )
}
