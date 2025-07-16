import React from 'react'
import type { Herb } from '../types'
import HerbCardAccordion from './HerbCardAccordion'

interface Props {
  herbs: Herb[]
}

const HerbList: React.FC<Props> = ({ herbs }) => {
  return (
    <div className='space-y-4'>
      {herbs.map(h => (
        <HerbCardAccordion key={h.id || h.name} herb={h} />
      ))}
    </div>
  )
}

export default HerbList
