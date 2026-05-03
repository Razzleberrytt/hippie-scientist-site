'use client'

import Card from '@/components/Card'
import { useEffect, useMemo, useState } from 'react'

// simplified for unified system

export default function LibraryBrowser({ title, items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(item => (
        <Card
          key={item.slug}
          title={item.title}
          subtitle={item.domain}
          description={item.summary}
          href={item.href}
          badge={item.isATier ? 'Top pick' : undefined}
        />
      ))}
    </div>
  )
}
