'use client'

import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, Check } from 'lucide-react'
import { EvidenceBadge } from '@/components/ui'
import { formatDisplayLabel, isClean, list as cleanList, text as cleanText } from '@/lib/display-utils'

type Compound = Record<string, any>

const text = (v: any) => {
  const value = cleanText(v)
  return isClean(value) ? formatDisplayLabel(value) : ''
}

const list = (v: any) => cleanList(v)

const getUseCaseLabel = (c: Compound) => {
  const h = `${text(c.role)} ${list(c.primary_effects || c.effects).join(' ')}`.toLowerCase()
  if (/strength|power|performance|muscle/.test(h)) return 'Strength'
  if (/stress|anxiety|calm|cortisol/.test(h)) return 'Stress'
  if (/sleep|insomnia|rest/.test(h)) return 'Sleep'
  if (/focus|cognition|memory|brain/.test(h)) return 'Focus'
  return text(c.role) || 'General wellness'
}

const summary = (v: any) => {
  const i = list(v)
  return i.length ? i.slice(0, 2).join(' · ') : '—'
}

const POPULAR_SLUGS = [
  'caffeine',
  'l-theanine',
  'creatine',
  'ashwagandha',
  'melatonin',
  'curcumin',
  'rhodiola'
]

export function CompareTableClient({ compounds }: { compounds: Compound[] }) {
  const searchParams = useSearchParams()
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Initialize selected slugs from URL, or default to caffeine and l-theanine
  useEffect(() => {
    const param = searchParams.get('c')
    if (param) {
      const slugs = param.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 3)
      setSelectedSlugs(slugs)
    } else {
      setSelectedSlugs(['caffeine', 'l-theanine'])
    }
  }, [searchParams])

  const updateUrl = (slugs: string[]) => {
    const params = new URLSearchParams(window.location.search)
    if (slugs.length > 0) {
      params.set('c', slugs.join(','))
    } else {
      params.delete('c')
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl)
  }

  const toggleCompound = (slug: string) => {
    const lowerSlug = slug.toLowerCase()
    let nextSlugs = [...selectedSlugs]

    if (nextSlugs.includes(lowerSlug)) {
      nextSlugs = nextSlugs.filter(s => s !== lowerSlug)
    } else {
      if (nextSlugs.length >= 3) {
        nextSlugs = [...nextSlugs.slice(1), lowerSlug]
      } else {
        nextSlugs.push(lowerSlug)
      }
    }

    setSelectedSlugs(nextSlugs)
    updateUrl(nextSlugs)
  }

  const selectedCompounds = useMemo(() => {
    return selectedSlugs
      .map(slug => compounds.find(c => String(c.slug || '').toLowerCase() === slug))
      .filter((c): c is Compound => Boolean(c))
  }, [selectedSlugs, compounds])

  const popularCompounds = useMemo(() => {
    return compounds.filter(c => POPULAR_SLUGS.includes(String(c.slug || '').toLowerCase()))
  }, [compounds])

  const filteredCompounds = useMemo(() => {
    if (!searchQuery) return []
    const query = searchQuery.toLowerCase()
    return compounds
      .filter(c => 
        (c.name || '').toLowerCase().includes(query) || 
        (c.slug || '').toLowerCase().includes(query)
      )
      .slice(0, 6)
  }, [searchQuery, compounds])

  const rows: [string, (c: Compound) => any][] = [
    ['Best for', c => summary(c.effects || c.primary_effects)],
    ['Evidence', c => <EvidenceBadge value={text(c.evidence_tier || c.evidenceTier || c.evidence_grade) || 'Limited'} />],
    ['Time to effect', c => text(c.time_to_effect) || 'Not specified'],
    ['Product Quality / Form', c => text(c.form || c.typical_preparation || c.standardization) || 'Standard extract'],
    ['Use case', c => getUseCaseLabel(c) || '—'],
    ['Safety notes', c => summary(c.safety_flags || c.safetyNotes || c.contraindications)],
    ['Complexity', c => text(c.complexity) || 'Low'],
    ['Cost', c => text(c.cost) || 'Low']
  ]

  return (
    <div className="space-y-6">
      {/* Interactive Selection Dashboard */}
      <div className="card-premium p-6 space-y-6 bg-white/95">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Compound Search Input */}
          <div className="space-y-2 relative">
            <label htmlFor="compound-search" className="text-sm font-semibold text-ink">
              Search and add compounds to compare:
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                id="compound-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Type to search (e.g. Rhodiola, Kanna)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-brand-900/10 focus:border-brand-700 bg-white/80 text-sm text-ink placeholder:text-muted transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setShowDropdown(false)
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && filteredCompounds.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1.5 rounded-2xl border border-brand-900/10 bg-white shadow-lg max-h-60 overflow-y-auto py-2">
                {filteredCompounds.map((c) => {
                  const isSelected = selectedSlugs.includes(String(c.slug || '').toLowerCase())
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        toggleCompound(c.slug)
                        setSearchQuery('')
                        setShowDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-brand-50 flex items-center justify-between text-ink transition"
                    >
                      <span>{c.name || c.slug}</span>
                      {isSelected && <Check className="h-4 w-4 text-brand-700" />}
                    </button>
                  )
                })}
              </div>
            )}
            {showDropdown && searchQuery && filteredCompounds.length === 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1.5 rounded-2xl border border-brand-900/10 bg-white shadow-lg p-4 text-sm text-muted">
                No matching compounds found.
              </div>
            )}
          </div>

          {/* Selected Compounds Badges */}
          <div className="space-y-2">
            <span className="text-sm font-semibold text-ink block">
              Currently comparing (max 3):
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedCompounds.map((c) => (
                <span
                  key={c.slug}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 border-2 border-brand-900 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md"
                >
                  <span>{c.name || c.slug}</span>
                  <button
                    type="button"
                    onClick={() => toggleCompound(c.slug)}
                    aria-label={`Remove ${c.name || c.slug}`}
                    className="hover:bg-white/20 rounded-full p-0.5 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {selectedCompounds.length === 0 && (
                <span className="text-sm text-muted italic pt-1 block">
                  No compounds selected. Click popular options below or search to select.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Popular Toggles */}
        <div className="space-y-2 pt-4 border-t border-brand-900/5">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 block">
            Popular options:
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {popularCompounds.map((c) => {
              const isSelected = selectedSlugs.includes(String(c.slug || '').toLowerCase())
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => toggleCompound(c.slug)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition border ${
                    isSelected
                      ? 'bg-brand-50 border-brand-700 text-brand-800'
                      : 'bg-white hover:bg-brand-50/50 border-brand-900/10 text-muted hover:text-ink'
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-brand-700" />}
                  <span>{c.name || c.slug}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {selectedCompounds.length >= 2 ? (
        <div className="overflow-x-auto rounded-[1.65rem] border border-brand-900/10 bg-white shadow-sm">
          <table className="min-w-[720px] w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-brand-900/10 bg-brand-950/[0.01]">
                <th className="p-4 font-bold text-ink uppercase tracking-wider text-xs w-1/4">Metric</th>
                {selectedCompounds.map(c => (
                  <th key={c.slug} className="p-4 font-semibold text-base text-ink">
                    <Link 
                      href={`/compounds/${c.slug}`} 
                      className="text-brand-800 hover:text-brand-700 font-bold underline decoration-brand-700/25 hover:decoration-brand-700/60 underline-offset-4"
                    >
                      {c.name || c.slug}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, render]) => (
                <tr key={label} className="border-b border-brand-900/5 align-top last:border-0">
                  <th className="p-4 font-medium text-ink bg-brand-950/[0.005] w-1/4">{label}</th>
                  {selectedCompounds.map(c => (
                    <td key={`${c.slug}-${label}`} className="p-4 text-muted">
                      {render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-premium p-10 text-center space-y-4">
          <p className="text-lg text-ink font-medium">
            Compare compounds side-by-side.
          </p>
          <p className="text-sm text-muted max-w-md mx-auto">
            Select 2 or 3 compounds from the list or search bar above to see their evidence level, timing, safety, and typical costs compared.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedSlugs(['caffeine', 'l-theanine'])
                updateUrl(['caffeine', 'l-theanine'])
              }}
              className="button-secondary text-xs py-2 px-4"
            >
              Compare Caffeine vs L-Theanine
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSlugs(['ashwagandha', 'rhodiola'])
                updateUrl(['ashwagandha', 'rhodiola'])
              }}
              className="button-secondary text-xs py-2 px-4"
            >
              Compare Ashwagandha vs Rhodiola
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

