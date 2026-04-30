import React from 'react'
import { Link } from '@/lib/router-compat'
import { slugify } from '@/lib/slug'
import TagBadge from './TagBadge'

export default function CompoundBadge({ name }: { name: string }) {
  return (
    <Link to={`/compounds/${slugify(name)}`} className='inline-block'>
      <TagBadge label={name} variant='green' />
    </Link>
  )
}
