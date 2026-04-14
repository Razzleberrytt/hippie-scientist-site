// UPDATED: Rebuilt herb detail with sr-only prerender block, placeholder/safety cleanup, and progressive disclosure sections.
import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useCompoundDataState } from '@/lib/compound-data'
import { useHerbDataState, useHerbDetailState } from '@/lib/herb-data'
import { dedupePresentationList, normalizePresentationLabel, sanitizeReadableText, sanitizeSummaryText } from '@/lib/sanitize'
import { buildUniqueDetailCopy, sanitizeRenderChips, sanitizeRenderList } from '@/lib/renderGuard'
import { normalizeTagList } from '@/lib/tagNormalization'
import { HerbDetailSkeleton } from '@/components/skeletons/DetailSkeletons'
import { SITE_URL, breadcrumbJsonLd, herbJsonLd } from '@/lib/seo'
import { shouldShowRawDebug } from '@/lib/semanticCompression'
import { getPrimaryEffects, getProfileStatus, getSummaryQuality, shouldRenderSummary } from '@/lib/workbookRender'

type SourceRef = { title: string; url: string; note?: string }

type DisclosureProps = {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

function toTitleCase(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

function splitTextList(value: unknown): string[] {
  return normalizeTagList(value, { caseStyle: 'none', minLength: 1, maxItems: 50 })
}

function readRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return {}
    try {
      const parsed = JSON.parse(trimmed)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {}
    } catch {
      return {}
    }
  }
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function readWorkbookText(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = String(raw[key] || '').trim()
    if (value) return value
  }
  return ''
}

function toEvidenceStrengthLabel(value: string) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return 'Limited'
  if (/(high|strong|clinical)/.test(normalized)) return 'Clinical'
  if (/(moderate|mixed|emerging|promising|some)/.test(normalized)) return 'Limited'
  if (/(low|minimal|weak|traditional|insufficient|unclear)/.test(normalized)) return 'Traditional'
  return toTitleCase(normalized)
}

function isPlaceholder(text: string, herbName?: string) {
  const value = String(text || '').trim().toLowerCase()
  if (!value) return false
  const normalizedHerb = String(herbName || '').trim().toLowerCase()
  const genericPatterns = [
    /^herb profile\.?$/i,
    /^reference profile\.?$/i,
    /^no direct/i,
    /^contextual inference/i,
  ]
  if (genericPatterns.some(pattern => pattern.test(value))) return true
  if (!normalizedHerb) return false
  const escapedName = normalizedHerb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const namedPattern = new RegExp(`^${escapedName}\\s+(herb|reference)\\s+profile\\.?$`, 'i')
  return namedPattern.test(value)
}

function toSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return []
  const map = new Map<string, SourceRef>()
  value.forEach(item => {
    if (typeof item === 'string') {
      const next = item.trim()
      if (!next) return
      const key = next.toLowerCase()
      if (!map.has(key)) map.set(key, { title: next, url: next })
      return
    }
    if (!item || typeof item !== 'object') return
    const record = item as Record<string, unknown>
    const title = String(record.title || record.url || '').trim()
    const url = String(record.url || '').trim()
    const note = String(record.note || '').trim()
    if (!title && !url) return
    const source: SourceRef = { title: title || url, url: url || title }
    if (note) source.note = note
    const key = `${source.title.toLowerCase()}|${source.url.toLowerCase()}`
    if (!map.has(key)) map.set(key, source)
  })
  return Array.from(map.values())
}

function DisclosureSection({ title, defaultOpen = false, children }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className='detail-panel fade-in-surface'>
      <button
        type='button'
        className='flex w-full items-center justify-between px-4 py-3 text-left'
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
      >
        <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-white/85'>{title}</h2>
        <span className='text-xs text-white/60'>{open ? 'Hide' : 'Show'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key='content'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='overflow-hidden'
          >
            <div className='border-t border-white/10 px-4 py-3 text-sm leading-relaxed text-white/80'>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default function HerbDetail() {
  const { slug = '' } = useParams()
  const location = useLocation()
  const showRawDebug = shouldShowRawDebug(location.search)
  const { herb, isLoading } = useHerbDetailState(slug)
  const { herbs } = useHerbDataState()
  const { compounds } = useCompoundDataState()

  if (isLoading) return <HerbDetailSkeleton />

  if (!herb) {
    return (
      <main className='container mx-auto max-w-4xl px-4 py-8 text-white'>
        <p className='text-white/65'>Herb profile not found.</p>
        <Link to='/herbs' className='btn-secondary mt-4 inline-flex'>
          ← Back to Herbs
        </Link>
      </main>
    )
  }

  const herbName = toTitleCase(herb.commonName || herb.common || herb.name || herb.slug)
  const scientificName = String(herb.scientific || herb.latinName || '').trim()
  const curatedData = herb.curatedData
  const rawRecord = readRecord(herb.rawData)
  const contextRecord = readRecord(rawRecord.context)
  const safetyRecord = readRecord(rawRecord.safety)
  const profileStatus = getProfileStatus(rawRecord)
  const summaryQuality = getSummaryQuality(rawRecord)
  const isMinimalProfile = profileStatus === 'minimal'
  const showSummaryRegion = shouldRenderSummary(profileStatus, summaryQuality)
  const description = readWorkbookText(rawRecord, 'hero', 'summary', 'description') || String(curatedData.summary || '').trim()
  const descriptionIsPlaceholder = isPlaceholder(description, herbName)
  const summary = sanitizeSummaryText(description, 2)
  const fullDescription = sanitizeReadableText(description)
  const uniqueCopy = buildUniqueDetailCopy({
    hero: summary,
    overview: sanitizeSummaryText(
      readWorkbookText(rawRecord, 'coreInsight', 'overview', 'whyItMatters') || curatedData.whyItMatters,
      1,
    ),
    context: sanitizeSummaryText(
      readWorkbookText(contextRecord, 'summary', 'overview', 'notes') || readWorkbookText(rawRecord, 'context'),
      2,
    ),
    mechanism: readWorkbookText(rawRecord, 'mechanisms', 'mechanism') || String(curatedData.mechanism || '').trim(),
  })
  const coreInsight = uniqueCopy.overview

  const effects = sanitizeRenderChips(
    dedupePresentationList(splitTextList(rawRecord.effects || rawRecord.keyEffects || curatedData.keyEffects), 8),
    8,
  )
  const keyEffects = getPrimaryEffects(rawRecord, 4)
  const activeCompounds = sanitizeRenderList(splitTextList(herb.activeCompounds || herb.compounds), 10)
  const mechanism = uniqueCopy.mechanism
  const contextSummary = uniqueCopy.context
  const dosage = String(herb.dosage || '').trim()
  const duration = String(herb.duration || '').trim()
  const preparation = String(herb.preparation || '').trim()
  const standardization = String(herb.standardization || '').trim()
  const contraindications = splitTextList(herb.contraindications)
  const interactions = splitTextList(herb.interactions)
  const sideEffects = splitTextList(herb.sideeffects || herb.sideEffects)
  const safety = splitTextList(
    safetyRecord.notes ||
      safetyRecord.summary ||
      safetyRecord.caution ||
      rawRecord.safety ||
      (herb as Record<string, unknown>).safetyNotes ||
      (herb as Record<string, unknown>).safety,
  )

  const rawSafetyNotes = dedupePresentationList([
    ...contraindications,
    ...interactions,
    ...sideEffects,
    ...safety,
  ], 8)
    .map(note => normalizePresentationLabel(note))
    .filter(Boolean)
  const safetyNotes = normalizeTagList(rawSafetyNotes, { caseStyle: 'title', maxItems: 8 })

  const priorityWarning = safetyNotes.find(note => /(pregnancy|cardiac|avoid)/i.test(note))

  const sources = toSources(herb.sources)
  const confidenceLabel = toEvidenceStrengthLabel(String(herb.evidenceLevel || herb.confidence || 'Limited'))
  const useCasePoints = [
    contextSummary || coreInsight,
    effects[0] ? `Best for ${effects[0].toLowerCase()} goals when you want a gentler herbal option.` : '',
    effects[1] ? `May also support ${effects[1].toLowerCase()} depending on preparation and dose.` : '',
    confidenceLabel === 'Traditional'
      ? 'Evidence is mostly traditional or early-stage, so reliability may vary between people.'
      : confidenceLabel === 'Limited'
        ? 'Evidence is limited, so treat this as supportive rather than first-line care.'
        : 'Clinical evidence exists, but responses still vary by product quality and consistency.',
    priorityWarning ? `Use caution: ${priorityWarning}.` : 'Avoid if safety context, medications, or medical status are unclear.',
  ].filter(Boolean)
  const pagePath = `/herbs/${herb.slug}`
  const relatedHerbs = herbs
    .filter(item => item.slug && item.slug !== herb.slug)
    .slice(0, 4)
    .map(item => ({
      label: toTitleCase(item.common || item.name || item.slug),
      to: `/herbs/${item.slug}`,
    }))

  const compoundIndex = new Map(compounds.map(compound => [String(compound.name || '').toLowerCase(), compound]))
  const relatedCompounds = activeCompounds
    .map(name => {
      const match = compoundIndex.get(name.toLowerCase())
      if (!match?.slug) return null
      return {
        label: toTitleCase(match.name),
        to: `/compounds/${match.slug}`,
      }
    })
    .filter((item): item is { label: string; to: string } => Boolean(item))

  return (
    <main className='container mx-auto max-w-5xl px-4 py-8 text-white sm:py-10'>
      <Meta
        title={`${herbName} Herb Guide | The Hippie Scientist`}
        description={`${herbName} effects, dosage context, safety notes, and sources.`}
        path={pagePath}
        image={`/og/herb/${herb.slug}.png`}
        jsonLd={[
          herbJsonLd({
            name: herbName,
            slug: herb.slug,
            description: description || `${herbName} herb profile`,
            latinName: scientificName,
          }),
          breadcrumbJsonLd([
            { name: 'Home', url: SITE_URL },
            { name: 'Herbs', url: `${SITE_URL}/herbs` },
            { name: herbName, url: `${SITE_URL}${pagePath}` },
          ]),
        ]}
      />

      <div className='mb-2 text-xs text-white/60'>
        <Link to='/' className='hover:text-white'>
          Home
        </Link>{' '}
        &gt;{' '}
        <Link to='/herbs' className='hover:text-white'>
          Herbs
        </Link>{' '}
        &gt; <span className='text-white/85'>{herbName}</span>
      </div>

      <article className='space-y-5'>
        <div className='sr-only' aria-hidden='true'>
          <h1>{herbName}</h1>
          <p>{summary}</p>
          <ul>{safetyNotes.map(note => <li key={`static-safety-${note}`}>{note}</li>)}</ul>
        </div>

        <header className='premium-panel fade-in-surface p-5 sm:p-7'>
          <p className='section-label'>Herb profile</p><h1 className='mt-2 text-4xl font-semibold sm:text-5xl'>{herbName}</h1>
          {scientificName && <p className='mt-1 text-sm italic text-white/55'>{scientificName}</p>}
          {showSummaryRegion && !descriptionIsPlaceholder && (
            <p className='mt-3 max-w-3xl text-sm leading-relaxed text-white/80'>{summary}</p>
          )}

          <section className='mt-3'>
            <h2 className='text-xs font-semibold uppercase tracking-[0.16em] text-white/62'>Key effects</h2>
            <div className='mt-2 flex flex-wrap gap-2'>
              {keyEffects.length > 0 ? (
                keyEffects.map(effect => (
                  <span
                    key={effect}
                    className='neo-pill rounded-full border px-2.5 py-1 text-xs'
                  >
                    {effect}
                  </span>
                ))
              ) : null}
            </div>
          </section>

          <div className='mt-3 inline-flex rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white/84'>
            Evidence strength: {confidenceLabel}
          </div>
        </header>

        {!isMinimalProfile && <section className='browse-shell fade-in-surface p-5 sm:p-6'>
          <h2 className='section-label text-white/82'>Use case framework</h2>
          <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-white/85'>
            {useCasePoints.slice(0, 3).map(point => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>}

        {safetyNotes.length > 0 && (
          <DisclosureSection title='Safety & Interactions' defaultOpen={Boolean(priorityWarning)}>
            <ul className='list-disc space-y-1 pl-5'>
              {safetyNotes.map(note => (
                <li key={`safety-${note}`}>{note}</li>
              ))}
            </ul>
          </DisclosureSection>
        )}

        {!isMinimalProfile && <DisclosureSection title='Active Compounds' defaultOpen>
          {activeCompounds.length > 0 ? (
            <ul className='list-disc space-y-1 pl-5'>
              {activeCompounds.map(compound => (
                <li key={compound}>{compound}</li>
              ))}
            </ul>
          ) : (
            <p>Compound list is being expanded.</p>
          )}
        </DisclosureSection>}

        {!isMinimalProfile && summaryQuality === 'strong' && coreInsight && coreInsight !== summary && (
          <section className='browse-shell fade-in-surface p-5 sm:p-6'>
            <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-white/85'>Core insight</h2>
            <p className='mt-2 text-sm leading-relaxed text-white/85'>{coreInsight}</p>
          </section>
        )}

        {!isMinimalProfile && !descriptionIsPlaceholder && fullDescription && fullDescription !== summary && (
          <DisclosureSection title='Full Description'>
            <p>{fullDescription}</p>
          </DisclosureSection>
        )}

        {!isMinimalProfile && mechanism && (
          <DisclosureSection title='Mechanism of Action'>
            <p>{mechanism}</p>
          </DisclosureSection>
        )}

        {!isMinimalProfile && contextSummary && contextSummary !== summary && (
          <DisclosureSection title='Context'>
            <p>{contextSummary}</p>
          </DisclosureSection>
        )}

        {!isMinimalProfile && (dosage || duration || preparation || standardization) && <DisclosureSection title='Dosage & Usage'>
          <ul className='list-disc space-y-1 pl-5'>
            {dosage && <li>Dosage: {dosage}</li>}
            {duration && <li>Duration: {duration}</li>}
            {preparation && <li>Preparation: {preparation}</li>}
            {standardization && <li>Standardization: {standardization}</li>}
          </ul>
        </DisclosureSection>}

        <DisclosureSection title='Research & Sources'>
          {sources.length > 0 ? (
            <ol className='list-decimal space-y-1 pl-5'>
              {sources.map(source => (
                <li key={`${source.title}-${source.url}`}>
                  {source.url.startsWith('http') ? (
                    <a
                      href={source.url}
                      target='_blank'
                      rel='noreferrer'
                      className='text-cyan-200 hover:text-cyan-100'
                    >
                      {source.title}
                    </a>
                  ) : (
                    <span>{source.title}</span>
                  )}
                  {source.note ? <span className='text-white/60'> — {source.note}</span> : null}
                </li>
              ))}
            </ol>
          ) : null}
        </DisclosureSection>

        {showRawDebug && herb.rawData && (
          <DisclosureSection title='Debug Raw Data'>
            <pre className='overflow-auto rounded-lg border border-amber-200/20 bg-black/30 p-3 text-[11px] text-amber-100/90'>
              {JSON.stringify(herb.rawData, null, 2)}
            </pre>
          </DisclosureSection>
        )}

        {!isMinimalProfile && <DisclosureSection title='Related Herbs & Compounds'>
          <div className='space-y-3'>
            {relatedHerbs.length > 0 && (
              <div>
                <p className='mb-1 text-xs uppercase tracking-[0.14em] text-white/55'>Herbs</p>
                <div className='flex flex-wrap gap-2'>
                  {relatedHerbs.map(item => (
                    <Link key={item.to} to={item.to} className='btn-secondary text-xs'>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {relatedCompounds.length > 0 && (
              <div>
                <p className='mb-1 text-xs uppercase tracking-[0.14em] text-white/55'>Compounds</p>
                <div className='flex flex-wrap gap-2'>
                  {relatedCompounds.map(item => (
                    <Link key={item.to} to={item.to} className='btn-secondary text-xs'>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DisclosureSection>}
      </article>
    </main>
  )
}
