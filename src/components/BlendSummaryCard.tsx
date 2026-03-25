import React from 'react'
import type { Herb } from '../types'
import TagBadge from './TagBadge'
import { Button } from '@/components/ui/Button'
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
  const effects = Array.from(new Set(herbs.flatMap(h => splitField(h.effects)))).join(', ')
  return `Combines ${names} for effects including ${effects}.`
}

export default function BlendSummaryCard({ herbs, onSave }: Props) {
  const name = React.useMemo(() => generateName(herbs), [herbs])
  const summary = React.useMemo(() => generateSummary(herbs), [herbs])
  const tags = React.useMemo(
    () => Array.from(new Set(herbs.flatMap(h => splitField(h.tags)))).slice(0, 4),
    [herbs]
  )

  return (
    <div className='ds-card-lg ds-stack text-white'>
      <h2 className='text-2xl font-bold'>{name}</h2>
      <p className='ds-text-muted'>{summary}</p>
      <div className='flex flex-wrap gap-2'>
        {tags.map(tag => (
          <TagBadge key={tag} label={tag} />
        ))}
      </div>
      {herbs.length >= 2 && (
        <Button type='button' variant='secondary' onClick={onSave}>
          Save Blend
        </Button>
      )}
    </div>
  )
}
