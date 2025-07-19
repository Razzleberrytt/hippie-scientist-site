import React from 'react'
import InfoTooltip from './InfoTooltip'
import baseCompounds from '../data/compoundData'

interface Props {
  name: string
  children: React.ReactNode
}

export default function CompoundTooltip({ name, children }: Props) {
  const compound = React.useMemo(
    () => baseCompounds.find(c => c.name.toLowerCase() === name.toLowerCase()),
    [name]
  )
  if (!compound) return <>{children}</>

  const lines = [
    compound.type,
    compound.mechanism,
    compound.duration && `Duration: ${compound.duration}`,
    compound.toxicity && `Toxicity: ${compound.toxicity}`,
    compound.originHerbs && compound.originHerbs.length > 0 &&
      `Sources: ${compound.originHerbs.join(', ')}`,
    compound.biosynthesisNotes && `Bio: ${compound.biosynthesisNotes}`,
  ].filter(Boolean)

  return (
    <InfoTooltip text={lines.join('\n')}>
      {children}
    </InfoTooltip>
  )
}
