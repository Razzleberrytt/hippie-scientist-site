'use client'

import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, Check } from 'lucide-react'
import { EvidenceBadge } from '@/components/ui'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { formatDisplayLabel, isClean, list as cleanList, text as cleanText } from '@/lib/display-utils'

type Compound = Record<string, any>

const text = (v: Record<string, unknown>) => {
  const value = cleanText(v)
  return isClean(value) ? formatDisplayLabel(value) : ''
}

const list = (v: Record<string, unknown>) => cleanList(v)

const getUseCaseLabel = (c: Compound) => {
  const h = `${text(c.role)} ${list(c.primary_effects || c.effects).join(' ')}`.toLowerCase()
  if (/strength|power|performance|muscle/.test(h)) return 'Strength'
  if (/stress|anxiety|calm|cortisol/.test(h)) return 'Stress'
  if (/sleep|insomnia|rest/.test(h)) return 'Sleep'
  if (/focus|cognition|memory|brain/.test(h)) return 'Focus'
  return text(c.role) || 'General wellness'
}

const summary = (v: Record<string, unknown>) => {
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

const SEARCH_RESULTS_ID = 'compound-search-results'

export function CompareTableClient({ compounds }: { compounds: Compound[] }) {
  const searchParams = useSearchParams()
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Initialize selected slugs from URL, or default to caffeine and l-theanine
  useEffect(() => {
    const param = searchParams?.get('c')
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
      <div className="card-premium space-y-6 bg-white/95 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Compound Search Input */}
          <div className="relative space-y-2">
            <label htmlFor="compound-search" className="text-sm font-semibold text-ink">
              Search and add compounds to compare:
            </label>
            <div className="relative">
              <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="compound-search"
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                aria-controls={SEARCH_RESULTS_ID}
                placeholder="Type to search (e.g. Rhodiola, Kanna)..."
                className="min-h-11 w-full rounded-full border border-brand-900/10 bg-white/80 py-2 pl-10 pr-12 text-sm text-ink placeholder:text-muted transition focus:border-brand-700"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setShowDropdown(false)
                  }}
                  aria-label="Clear compound search"
                  className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full p-2 text-muted transition duration-150 hover:bg-brand-50 hover:text-ink"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && filteredCompounds.length > 0 && (
              <div id={SEARCH_RESULTS_ID} aria-label="Compound search results" className="absolute left-0 right-0 z-10 mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-brand-900/10 bg-white py-2 shadow-lg dark:bg-[var(--surface-card-strong)]">
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
                      aria-pressed={isSelected}
                      className="flex min-h-11 w-full items-center justify-between px-4 py-2 text-left text-sm text-ink transition hover:bg-brand-50 dark:hover:bg-white/10"
                    >
                      <span>{c.name || c.slug}</span>
                      {isSelected && <Check aria-hidden="true" className="h-4 w-4 text-brand-700" />}
                    </button>
                  )
                })}
              </div>
            )}
            {showDropdown && searchQuery && filteredCompounds.length === 0 && (
              <div id={SEARCH_RESULTS_ID} role="status" className="absolute left-0 right-0 z-10 mt-1.5 rounded-2xl border border-brand-900/10 bg-white p-4 text-sm text-muted shadow-lg dark:bg-[var(--surface-card-strong)]">
                No matching compounds found.
              </div>
            )}
          </div>

          {/* Selected Compounds Badges */}
          <div className="space-y-2">
            <span className="block text-sm font-semibold text-ink">
              Currently comparing (max 3):
            </span>
            <div className="flex flex-wrap gap-2 pt-1" aria-live="polite">
              {selectedCompounds.map((c) => (
                <span
                  key={c.slug}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-900 bg-brand-700 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md"
                >
                  <span>{c.name || c.slug}</span>
                  <button
                    type="button"
                    onClick={() => toggleCompound(c.slug)}
                    aria-label={`Remove ${c.name || c.slug} from comparison`}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-1 transition hover:bg-white/20"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {selectedCompounds.length === 0 && (
                <span className="block pt-1 text-sm italic text-muted">
                  No compounds selected. Click popular options below or search to select.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Popular Toggles */}
        <div className="space-y-2 border-t border-brand-900/5 pt-4">
          <span className="block text-xs font-bold uppercase tracking-wider text-brand-700">
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
                  aria-pressed={isSelected}
                  className={`inline-flex min-h-11 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? 'border-brand-700 bg-brand-50 text-brand-800'
                      : 'border-brand-900/10 bg-white text-muted hover:bg-brand-50/50 hover:text-ink dark:bg-white/5'
                  }`}
                >
                  {isSelected && <Check aria-hidden="true" className="h-3.5 w-3.5 text-brand-700" />}
                  <span>{c.name || c.slug}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {selectedCompounds.length >= 2 ? (
        <ResponsiveTable
          label="Comparison matrix of selected compounds"
          hint="This comparison table scrolls horizontally on small screens. The first column lists metrics, and each following column represents a selected compound."
          className="rounded-[1.65rem] bg-white dark:bg-[var(--surface-card-strong)]"
        >
          <table className="min-w-[720px] w-full border-collapse text-left text-sm">
            <caption>Selected compound comparison by metric</caption>
            <thead>
              <tr className="border-b border-brand-900/10 bg-brand-950/[0.01]">
                <th scope="col" className="w-1/4 p-4 text-xs font-bold uppercase tracking-wider text-ink">Metric</th>
                {selectedCompounds.map(c => (
                  <th scope="col" key={c.slug} className="p-4 text-base font-semibold text-ink">
                    <Link
                      href={`/compounds/${c.slug}`}
                      className="font-bold text-brand-800 underline decoration-brand-700/25 underline-offset-4 hover:text-brand-700 hover:decoration-brand-700/60"
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
                  <th scope="row" className="w-1/4 bg-brand-950/[0.005] p-4 font-medium text-ink">{label}</th>
                  {selectedCompounds.map(c => (
                    <td key={`${c.slug}-${label}`} className="p-4 text-muted">
                      {render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTable>
      ) : (
        <div className="card-premium space-y-4 p-10 text-center">
          <p className="text-lg font-medium text-ink">
            Compare compounds side-by-side.
          </p>
          <p className="mx-auto max-w-md text-sm text-muted">
            Select 2 or 3 compounds from the list or search bar above to see their evidence level, timing, safety, and typical costs compared.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedSlugs(['caffeine', 'l-theanine'])
                updateUrl(['caffeine', 'l-theanine'])
              }}
              className="button-secondary px-4 py-2 text-xs"
            >
              Compare Caffeine vs L-Theanine
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSlugs(['ashwagandha', 'rhodiola'])
                updateUrl(['ashwagandha', 'rhodiola'])
              }}
              className="button-secondary px-4 py-2 text-xs"
            >
              Compare Ashwagandha vs Rhodiola
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
