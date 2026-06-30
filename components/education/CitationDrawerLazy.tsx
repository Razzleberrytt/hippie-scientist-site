'use client'

import dynamic from 'next/dynamic'

const CitationDrawer = dynamic(() => import('../../src/components/learn/CitationDrawer'), {
  ssr: false,
})

export default function CitationDrawerLazy() {
  return <CitationDrawer />
}