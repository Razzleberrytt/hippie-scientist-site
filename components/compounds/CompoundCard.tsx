'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import EvidenceBadge from '@/components/ui/EvidenceBadge'

type CompoundCardProps = {
  compound: {
    slug: string
    title: string
    summary?: string
    href: string
    evidenceTier?: string
    evidence?: string
    safety?: string
    bestFor?: string
    primary_effects?: string[]
    effects?: string[]
    tags?: string[]
  }
}

const clean = (value?: string) => String(value || '').replace(/\s+/g, ' ').trim()

export default function CompoundCard({ compound }: CompoundCardProps) {
  const reduceMotion = useReducedMotion()

  const tags = (compound.primary_effects || compound.effects || compound.tags || []).map(clean).filter(Boolean).slice(0, 3)

  return (
    <motion.article
      layout
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{ type: 'spring', stiffness: 160, damping: 22, mass: 0.8 }}
      className="library-card-premium group relative flex h-full flex-col overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(221,193,127,.18),transparent_42%)]" />
      </div>

      <Link href={compound.href} className="relative flex h-full flex-col gap-7 rounded-card focus:outline-none focus:ring-4 focus:ring-brand-500/20">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="eyebrow-label">Compound profile</div>

            <h2 className="text-display text-2xl sm:text-3xl text-balance transition-colors duration-300 group-hover:text-brand-800">
              {compound.title}
            </h2>
          </div>

          <EvidenceBadge tier={compound.evidenceTier || compound.evidence} />
        </div>

        <p className="text-reading line-clamp-4 text-sm sm:text-base">
          {clean(compound.summary) || 'Evidence-aware compound profile with mechanism and safety context.'}
        </p>

        {compound.bestFor ? (
          <div className="rounded-2xl border border-brand-900/10 bg-paper-100/80 px-4 py-3 text-sm leading-6 text-muted-soft">
            {clean(compound.bestFor)}
          </div>
        ) : null}

        {tags.length ? (
          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            {tags.map(tag => (
              <span key={tag} className="chip-readable">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </Link>
    </motion.article>
  )
}
