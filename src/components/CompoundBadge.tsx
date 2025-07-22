import React from 'react'
import { Link } from 'react-router-dom'
import TagBadge from './TagBadge'
import InfoTooltip from './InfoTooltip'
import { slugify } from '../utils/slugify'
import { compounds as compoundList } from '../data/compounds'

export default function CompoundBadge({ name }: { name: string }) {
  const info = compoundList.find(
    c => c.name.toLowerCase() === name.toLowerCase()
  )
  const badge = (
    <Link to={`/compound/${slugify(name)}`} className='inline-block'>
      <TagBadge label={name} variant='green' />
    </Link>
  )
  return info ? <InfoTooltip text={info.type}>{badge}</InfoTooltip> : badge
}
