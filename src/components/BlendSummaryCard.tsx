import React from 'react'
import type { Herb } from '../types'
import TagBadge from './TagBadge'
import { herbName, splitField } from '../utils/herb'

interface Props {
  herbs: Herb[]
  onSave?: () => void
}

function generateName(herbs: Herb[]): string {
  if (herbs.length === 0) return 'Your Custom Blend'
  const parts = herbs.map(h => herbName(h).split(' ')[0])
  return parts.join(' ') + ' Fusion'
}

function generateSummary(herbs: Herb[]): string {
  if (!herbs.length) return 'Select herbs to see a summary of the blend.'
  const names = herbs.map(h => herbName(h)).join(', ')
  const effects = Array.from(
    new Set(herbs.flatMap(h => splitField(h.effects)))
  ).join(', ')
  return `Combines ${names} for effects including ${effects}.`
}

export default function BlendSummaryCard({ herbs, onSave }: Props) {
  const name = React.useMemo(() => generateName(herbs), [herbs])
  const summary = React.useMemo(() => generateSummary(herbs), [herbs])
  const tags = React.useMemo(() => {
    return Array.from(new Set(herbs.flatMap(h => splitField(h.tags))))
  }, [herbs])

  return (
    <div className='rounded-2xl bg-white/14 p-4 text-white ring-1 ring-white/12 shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] backdrop-blur-xl'>
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
          className='btn-secondary rounded-md px-3 py-1 text-sm text-white'
        >
          Save Blend
        </button>
      )}
    </div>
  )
}
