'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { listContainer, listItem, springConfig } from '@/utils/springConfig'
import compounds from '@/public/data/compounds.json'

export default function SearchPage() {
  const [query, setQuery] = useState('')

  const results = compounds.filter((c: any) =>
    c.name?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <main className="max-w-6xl mx-auto px-4 space-y-6 text-white">
      <GlassCard variant="heavy" className="p-6">
        <h1 className="text-4xl font-black">Search compounds</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search magnesium, creatine..."
          className="mt-4 w-full p-4 rounded-xl bg-black/30 border border-white/10"
        />
      </GlassCard>

      <motion.div variants={listContainer} initial="hidden" animate="show" className="grid gap-4">
        {results.map((c: any, i: number) => (
          <motion.div key={c.slug} variants={listItem} transition={springConfig.gentle}>
            <Link href={`/compounds/${c.slug}`}>
              <GlassCard className="p-4">
                <h2 className="font-bold">{c.name}</h2>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
