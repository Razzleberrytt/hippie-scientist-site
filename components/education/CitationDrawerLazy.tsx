'use client'

import dynamic from 'next/dynamic'

const CitationDrawer = dynamic(() => import('@/components/education/CitationDrawer'), {
  ssr: false,
})

export default function CitationDrawerLazy() {
  return <CitationDrawer />
}