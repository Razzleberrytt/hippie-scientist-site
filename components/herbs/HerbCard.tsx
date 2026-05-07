'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import EvidenceBadge from '@/components/ui/EvidenceBadge'
import { cleanSummary, editorialUseCaseLabel, isClean, list } from '@/lib/display-utils'

type HerbCardProps = {
  herb: {
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

function safetyTone(value?: string) {
  const text = clean(value).toLowerCase()
  if (/avoid|contraindicat|do not|pregnan|high concern/.test(text)) return 'border-safety-avoid/20 bg-rose-50 text-safety-avoid'
  if (/caution|interaction|review|consult|medication|unknown|limited/.test(text)) return 'border-safety-caution/20 bg-amber-50 text-safety-caution'
  if (/generally|well tolerated|low concern|safe|ok/.test(text)) return 'border-safety-ok/20 bg-emerald-50 text-safety-ok'
  return 'border-brand-900/10 bg-white/70 text-muted'
}

function safetyLabel(value?: string) {
  const text = clean(value).toLowerCase()
  if (/avoid|contraindicat|do not|pregnan|high concern/.test(text)) return 'Avoid'
  if (/caution|interaction|review|consult|medication|unknown|limited/.test(text)) return 'Caution'
  if (/generally|well tolerated|low concern|safe|ok/.test(text)) return 'Low concern'
  return 'Review safety'
}

export default function HerbCard({ herb }: HerbCardProps) {
  const reduceMotion = useReducedMotion()
  const tags = list(herb.primary_effects || herb.effects || herb.tags).slice(0, 3)
  const summary = cleanSummary(herb.summary, 'herb')
  const context = isClean(herb.bestFor) ? editorialUseCaseLabel(herb.bestFor) : tags[0]

  return (
    <motion.article
      layout
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{ type: 'spring', stiffness: 160, damping: 22, mass: 0.8 }}
      className="library-card-premium group relative flex h-full flex-col overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-nature-radial opacity-0 transition-opacity duration-500 group-hover:opacity-60" />

      <Link href={herb.href} className="relative flex h-full flex-col gap-7 rounded-card focus:outline-none focus:ring-4 focus:ring-brand-500/20">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="eyebrow-label">Herb profile</div>
            <h2 className="text-display text-2xl sm:text-3xl text-balance transition-colors duration-300 group-hover:text-brand-800">
              {herb.title}
            </h2>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <EvidenceBadge tier={herb.evidenceTier || herb.evidence} />
            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.16em] ${safetyTone(herb.safety)}`}>
              {safetyLabel(herb.safety)}
            </span>
          </div>
        </div>

        <p className="text-reading line-clamp-4 text-sm sm:text-base">
          {summary}
        </p>

        {context ? (
          <div className="rounded-2xl border border-brand-900/10 bg-paper-100/80 px-4 py-3 text-sm leading-6 text-[#46574d]">
            {context}
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
