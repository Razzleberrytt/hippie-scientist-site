import Collapse from '../ui/Collapse'
import { useEffect } from 'react'
import type { GovernedFaqSectionContent } from '../../lib/governedFaq'
import type { GovernedRelatedQuestionsSection } from '../../lib/governedRelatedQuestions'
import { trackGovernedEvent, type GovernedPageType } from '../../lib/governedAnalytics'
import type { ResearchClaim, ResearchEnrichment } from '@/types/researchEnrichment'
import { getEvidenceLabelMeta, getTopicJudgment } from '../../lib/governedResearch'

type ClaimSectionConfig = {
  key: string
  title: string
  topicType: string
  items: ResearchClaim[]
  framing?: string
}

type LinkRailItem = {
  href: string
  label: string
  meta: string
  note?: string
}

const MAX_PROFILE_ITEMS = 4

function cleanClaimText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function isWeakClaim(item: ResearchClaim) {
  const text = `${item.claim} ${item.strengthNote || ''}`.toLowerCase()
  return (
    !cleanClaimText(item.claim) ||
    /research[-\s]?pending/.test(text) ||
    /placeholder|not enough information|insufficient detail/.test(text)
  )
}

function meaningfulClaims(items: ResearchClaim[], limit = MAX_PROFILE_ITEMS) {
  return items.filter(item => !isWeakClaim(item)).slice(0, limit)
}

function hasProfileText(value: string | null | undefined) {
  return Boolean(value && cleanClaimText(value).length > 24)
}

function getEntityBasePath(entityType: 'herb' | 'compound') {
  return entityType === 'herb' ? '/herbs' : '/compounds'
}

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function relationLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildRelatedRails(enrichment: ResearchEnrichment) {
  const relatedEntities = enrichment.relatedEntities || []
  const rails: Record<string, LinkRailItem[]> = {
    relatedHerbs: [],
    relatedCompounds: [],
    mechanistic: [],
    exploredTogether: [],
    pathwayCompanions: [],
  }

  relatedEntities.forEach(entity => {
    const relationship = relationLabel(entity.relationshipType)
    const item: LinkRailItem = {
      href: `${getEntityBasePath(entity.entityType)}/${entity.slug}`,
      label: titleFromSlug(entity.slug),
      meta: relationship || entity.entityType,
      note: entity.notes,
    }
    const relationshipText = relationship.toLowerCase()

    if (entity.entityType === 'herb') rails.relatedHerbs.push(item)
    if (entity.entityType === 'compound') rails.relatedCompounds.push(item)
    if (/mechanism|pathway|constituent|target/.test(relationshipText)) rails.mechanistic.push(item)
    if (/similar|together|adjacent|related|pair|stack/.test(relationshipText)) rails.exploredTogether.push(item)
    if (/pathway|system|axis|cascade|metabolic/.test(relationshipText)) rails.pathwayCompanions.push(item)
  })

  return Object.fromEntries(
    Object.entries(rails).map(([key, items]) => [
      key,
      Array.from(new Map(items.map(item => [item.href, item])).values()).slice(0, 6),
    ]),
  ) as Record<keyof typeof rails, LinkRailItem[]>
}

function EvidenceMeta({ item }: { item: ResearchClaim }) {
  const pmids = item.primaryPmids || []
  const hasEvidence = Boolean(
    item.evidenceGrade || item.population || pmids.length > 0,
  )
  if (!hasEvidence) return null

  return (
    <div className='mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/75'>
      <p className='font-semibold uppercase tracking-[0.14em] text-white/55'>Evidence detail</p>
      <div className='mt-1.5 flex flex-wrap gap-x-3 gap-y-1'>
        {item.evidenceGrade && (
          <span>
            <span className='text-white/55'>Grade:</span> {item.evidenceGrade}
          </span>
        )}
        {item.population && (
          <span>
            <span className='text-white/55'>Population:</span> {item.population}
          </span>
        )}
        {pmids.length > 0 && (
          <span>
            <span className='text-white/55'>PMID:</span>{' '}
            {pmids.map((pmid, index) => (
              <span key={pmid}>
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-cyan-200 underline-offset-2 hover:underline'
                >
                  {pmid}
                </a>
                {index < pmids.length - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  )
}

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className='mt-7 rounded-3xl border border-white/12 bg-white/[0.035] p-4 shadow-sm shadow-black/10 sm:p-5'>
      {eyebrow && <p className='text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/60'>{eyebrow}</p>}
      <div className='mt-1 max-w-3xl'>
        <h2 className='text-lg font-semibold tracking-tight text-white sm:text-xl'>{title}</h2>
        {description && <p className='mt-2 text-sm leading-relaxed text-white/72'>{description}</p>}
      </div>
      <div className='mt-4'>{children}</div>
    </section>
  )
}

function SignalPill({ children }: { children: React.ReactNode }) {
  return (
    <span className='rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-50/90'>
      {children}
    </span>
  )
}

function ClaimCard({ item, tone = 'neutral' }: { item: ResearchClaim; tone?: 'neutral' | 'safety' | 'mechanism' }) {
  const toneClass =
    tone === 'safety'
      ? 'border-rose-300/25 bg-rose-500/10 text-rose-50/95'
      : tone === 'mechanism'
        ? 'border-violet-200/20 bg-violet-400/10 text-violet-50/95'
        : 'border-white/12 bg-white/[0.03] text-white/88'

  return (
    <li className={`rounded-2xl border px-3.5 py-3 ${toneClass}`}>
      <p className='text-sm leading-relaxed'>{item.claim}</p>
      {item.strengthNote && <p className='mt-1.5 text-xs leading-relaxed opacity-75'>{item.strengthNote}</p>}
      <EvidenceMeta item={item} />
    </li>
  )
}

function ClaimList({
  items,
  topicType,
  title,
  enrichment,
  framing,
}: ClaimSectionConfig & { enrichment: ResearchEnrichment }) {
  const filteredItems = meaningfulClaims(items, 8)
  if (!filteredItems.length) return null
  const judgment = getTopicJudgment(enrichment, topicType)
  const labelMeta = getEvidenceLabelMeta(judgment.evidenceLabel)

  return (
    <SectionShell title={title} description={framing}>
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        <span className={`rounded-full border px-3 py-1 text-xs ${labelMeta.className}`}>{labelMeta.title}</span>
        <span className='text-xs leading-relaxed text-white/65'>{labelMeta.tone}</span>
      </div>
      <ul className='grid gap-3 sm:grid-cols-2'>
        {filteredItems.map(item => (
          <ClaimCard key={item.claim} item={item} tone={topicType === 'pathway' ? 'mechanism' : 'neutral'} />
        ))}
      </ul>
    </SectionShell>
  )
}

function ProfileHeroV2({
  enrichment,
  governedFaq,
}: {
  enrichment: ResearchEnrichment
  governedFaq: GovernedFaqSectionContent
}) {
  const supportedUses = meaningfulClaims(enrichment.supportedUses, 3)
  const mechanisms = meaningfulClaims([...enrichment.constituents, ...enrichment.mechanisms], 3)
  const safetySignals = meaningfulClaims(
    [...enrichment.interactions, ...enrichment.contraindications, ...enrichment.adverseEffects],
    3,
  )
  const pageJudgment = enrichment.pageEvidenceJudgment
  const labelMeta = getEvidenceLabelMeta(pageJudgment.evidenceLabel)
  const hasUsefulSummary = hasProfileText(governedFaq.evidenceSnapshot) || hasProfileText(enrichment.evidenceSummary)

  return (
    <section className='mt-6 rounded-[1.75rem] border border-cyan-200/20 bg-gradient-to-br from-cyan-400/10 via-white/[0.035] to-violet-400/10 p-5 shadow-lg shadow-black/10 sm:p-6'>
      <div className='grid gap-5 lg:grid-cols-[1.4fr_0.8fr]'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70'>Premium scientific profile v2</p>
          <h2 className='mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl'>Evidence, mechanisms, and safety context</h2>
          {hasUsefulSummary && (
            <p className='mt-3 max-w-3xl text-base leading-relaxed text-white/82'>
              {governedFaq.evidenceSnapshot || enrichment.evidenceSummary}
            </p>
          )}
          <div className='mt-4 flex flex-wrap gap-2'>
            {supportedUses.map(item => (
              <SignalPill key={item.claim}>{item.claim}</SignalPill>
            ))}
          </div>
        </div>
        <div className='rounded-3xl border border-white/12 bg-black/20 p-4'>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-white/55'>Authority snapshot</p>
          <div className='mt-3 space-y-3 text-sm text-white/78'>
            <div>
              <p className='text-xs uppercase tracking-[0.14em] text-white/45'>Evidence label</p>
              <span className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs ${labelMeta.className}`}>{labelMeta.title}</span>
            </div>
            <div>
              <p className='text-xs uppercase tracking-[0.14em] text-white/45'>Primary mechanisms</p>
              <p className='mt-1 leading-relaxed'>
                {mechanisms.length > 0 ? mechanisms.map(item => item.claim).join(' · ') : 'Mechanism details are limited in the current evidence layer.'}
              </p>
            </div>
            <div>
              <p className='text-xs uppercase tracking-[0.14em] text-white/45'>Safety snapshot</p>
              <p className='mt-1 leading-relaxed'>
                {safetySignals.length > 0 ? safetySignals.map(item => item.claim).join(' · ') : 'No specific governed safety signal is available in this profile layer.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BestForFraming({ enrichment }: { enrichment: ResearchEnrichment }) {
  const knownFor = meaningfulClaims(enrichment.supportedUses, 3)
  const exploredFor = meaningfulClaims(enrichment.unsupportedOrUnclearUses, 3)
  const associatedWith = meaningfulClaims([...enrichment.constituents, ...enrichment.mechanisms], 3)
  const groups = [
    { title: 'Best Known For', items: knownFor },
    { title: 'Often Explored For', items: exploredFor },
    { title: 'Commonly Associated With', items: associatedWith },
  ].filter(group => group.items.length > 0)

  if (!groups.length) return null

  return (
    <section className='mt-6 grid gap-3 md:grid-cols-3'>
      {groups.map(group => (
        <div key={group.title} className='rounded-3xl border border-white/12 bg-white/[0.03] p-4'>
          <h2 className='text-xs font-semibold uppercase tracking-[0.18em] text-white/55'>{group.title}</h2>
          <ul className='mt-3 space-y-2'>
            {group.items.map(item => (
              <li key={item.claim} className='text-sm leading-relaxed text-white/84'>
                {item.claim}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

function WhyItMatters({ enrichment, governedFaq }: { enrichment: ResearchEnrichment; governedFaq: GovernedFaqSectionContent }) {
  const strongestApplications = meaningfulClaims(enrichment.supportedUses, 3)
  const mechanisms = meaningfulClaims([...enrichment.constituents, ...enrichment.mechanisms], 3)
  const uncertainty = governedFaq.whatRemainsUncertain.slice(0, 2)

  if (!strongestApplications.length && !mechanisms.length && !uncertainty.length) return null

  return (
    <SectionShell
      id='why-it-matters'
      eyebrow='Context'
      title='Why it matters'
      description='A concise read on practical relevance, researched applications, and where mechanism-level evidence should not be confused with established human outcomes.'
    >
      <div className='grid gap-3 lg:grid-cols-3'>
        {strongestApplications.length > 0 && (
          <div className='rounded-2xl border border-white/12 bg-white/[0.025] p-4'>
            <h3 className='text-sm font-semibold text-white'>Strongest researched applications</h3>
            <ul className='mt-2 space-y-2 text-sm leading-relaxed text-white/78'>
              {strongestApplications.map(item => <li key={item.claim}>{item.claim}</li>)}
            </ul>
          </div>
        )}
        {mechanisms.length > 0 && (
          <div className='rounded-2xl border border-white/12 bg-white/[0.025] p-4'>
            <h3 className='text-sm font-semibold text-white'>Mechanism context</h3>
            <ul className='mt-2 space-y-2 text-sm leading-relaxed text-white/78'>
              {mechanisms.map(item => <li key={item.claim}>{item.claim}</li>)}
            </ul>
          </div>
        )}
        {uncertainty.length > 0 && (
          <div className='rounded-2xl border border-white/12 bg-white/[0.025] p-4'>
            <h3 className='text-sm font-semibold text-white'>Evidence caution</h3>
            <ul className='mt-2 space-y-2 text-sm leading-relaxed text-white/78'>
              {uncertainty.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>
    </SectionShell>
  )
}

function PrimaryEffects({ enrichment }: { enrichment: ResearchEnrichment }) {
  const effects = meaningfulClaims(enrichment.supportedUses, 6)
  if (!effects.length) return null

  return (
    <SectionShell
      id='primary-effects'
      eyebrow='Intent matching'
      title='Primary effects'
      description='High-signal effect framing only; weak, empty, and research-pending labels are suppressed.'
    >
      <div className='flex flex-wrap gap-2'>
        {effects.map(item => <SignalPill key={item.claim}>{item.claim}</SignalPill>)}
      </div>
    </SectionShell>
  )
}

function EvidenceSafety({ enrichment, governedFaq }: { enrichment: ResearchEnrichment; governedFaq: GovernedFaqSectionContent }) {
  const safetyEntries = enrichment.safetyProfile?.safetyEntries || []
  const established = meaningfulClaims(enrichment.supportedUses, 4)
  const proposed = meaningfulClaims([...enrichment.constituents, ...enrichment.mechanisms], 4)
  const preliminary = meaningfulClaims([...enrichment.unsupportedOrUnclearUses, ...enrichment.researchGaps], 4)
  const cautions = [
    ...safetyEntries.map(entry => `${entry.targetName}: ${entry.findingTextShort}`),
    ...meaningfulClaims([...enrichment.interactions, ...enrichment.contraindications, ...enrichment.adverseEffects], 5).map(item => item.claim),
    ...governedFaq.keyCautions,
  ].filter(Boolean).slice(0, 7)

  return (
    <SectionShell
      id='governed-safety-interactions'
      eyebrow='Evidence + safety'
      title='Evidence and safety hierarchy'
      description='Established evidence, proposed mechanisms, preliminary findings, and caution signals are separated so the page reads like a governed scientific profile instead of a loose notes dump.'
    >
      <div className='grid gap-3 lg:grid-cols-2'>
        <div className='rounded-2xl border border-cyan-200/15 bg-cyan-400/10 p-4'>
          <h3 className='text-sm font-semibold text-cyan-50'>Established or better-supported evidence</h3>
          {established.length > 0 ? (
            <ul className='mt-3 space-y-2 text-sm leading-relaxed text-cyan-50/82'>
              {established.map(item => <li key={item.claim}>{item.claim}</li>)}
            </ul>
          ) : (
            <p className='mt-3 text-sm leading-relaxed text-cyan-50/70'>No strong supported-use claim is available in this governed layer.</p>
          )}
        </div>
        <div className='rounded-2xl border border-violet-200/15 bg-violet-400/10 p-4'>
          <h3 className='text-sm font-semibold text-violet-50'>Proposed mechanisms</h3>
          {proposed.length > 0 ? (
            <ul className='mt-3 space-y-2 text-sm leading-relaxed text-violet-50/82'>
              {proposed.map(item => <li key={item.claim}>{item.claim}</li>)}
            </ul>
          ) : (
            <p className='mt-3 text-sm leading-relaxed text-violet-50/70'>Mechanism detail is limited in this governed layer.</p>
          )}
        </div>
        {preliminary.length > 0 && (
          <div className='rounded-2xl border border-amber-200/15 bg-amber-400/10 p-4'>
            <h3 className='text-sm font-semibold text-amber-50'>Preliminary or unresolved findings</h3>
            <ul className='mt-3 space-y-2 text-sm leading-relaxed text-amber-50/82'>
              {preliminary.map(item => <li key={item.claim}>{item.claim}</li>)}
            </ul>
          </div>
        )}
        <div className='rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4'>
          <h3 className='text-sm font-semibold text-rose-50'>Safety and caution signals</h3>
          {cautions.length > 0 ? (
            <ul className='mt-3 space-y-2 text-sm leading-relaxed text-rose-50/88'>
              {cautions.map(item => <li key={item}>{item}</li>)}
            </ul>
          ) : (
            <p className='mt-3 text-sm leading-relaxed text-rose-50/72'>No specific caution signal is available in this governed profile layer.</p>
          )}
        </div>
      </div>
    </SectionShell>
  )
}

function DiscoveryRailGroup({ title, items }: { title: string; items: LinkRailItem[] }) {
  if (!items.length) return null

  return (
    <div className='rounded-2xl border border-white/12 bg-white/[0.025] p-4'>
      <h3 className='text-sm font-semibold text-white'>{title}</h3>
      <div className='mt-3 grid gap-2'>
        {items.map(item => (
          <a key={item.href} href={item.href} className='rounded-xl border border-white/10 bg-black/15 px-3 py-2 transition hover:border-cyan-200/30 hover:bg-cyan-300/10'>
            <span className='block text-sm font-medium text-cyan-50'>{item.label}</span>
            <span className='mt-0.5 block text-xs capitalize text-white/55'>{item.meta}</span>
            {item.note && <span className='mt-1 block text-xs leading-relaxed text-white/65'>{item.note}</span>}
          </a>
        ))}
      </div>
    </div>
  )
}

function InternalDiscoveryRails({ enrichment }: { enrichment: ResearchEnrichment }) {
  const rails = buildRelatedRails(enrichment)
  const hasRails = Object.values(rails).some(items => items.length > 0)
  if (!hasRails) return null

  return (
    <SectionShell
      id='internal-discovery-rails'
      eyebrow='Discovery'
      title='Explore connected profiles'
      description='Internal discovery rails support deeper sessions, crawl paths, and semantic context without changing the route or search architecture.'
    >
      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
        <DiscoveryRailGroup title='Related herbs' items={rails.relatedHerbs} />
        <DiscoveryRailGroup title='Related compounds' items={rails.relatedCompounds} />
        <DiscoveryRailGroup title='Mechanistically similar' items={rails.mechanistic} />
        <DiscoveryRailGroup title='Often explored together' items={rails.exploredTogether} />
        <DiscoveryRailGroup title='Pathway companions' items={rails.pathwayCompanions} />
      </div>
    </SectionShell>
  )
}

function RelatedQuestions({
  relatedQuestions,
  analyticsContext,
  enrichment,
}: {
  relatedQuestions: GovernedRelatedQuestionsSection
  analyticsContext?: {
    pageType: GovernedPageType
    entityType: 'herb' | 'compound'
    entitySlug: string
  }
  enrichment: ResearchEnrichment
}) {
  if (!relatedQuestions.items.length) return null

  return (
    <SectionShell
      id='governed-related-questions'
      eyebrow='Search intent'
      title='Related questions people might search'
      description='Concise answers and governed links for nearby intents.'
    >
      <div className='grid gap-3 md:grid-cols-2'>
        {relatedQuestions.items.map(item => (
          <div key={item.questionType} className='rounded-2xl border border-white/12 bg-white/[0.025] p-4'>
            <p className='text-sm font-semibold text-white'>{item.question}</p>
            <p className='mt-2 text-sm leading-relaxed text-white/78'>{item.answer}</p>
            {item.href && item.linkLabel && (
              <a
                href={item.href}
                className='mt-3 inline-flex text-xs font-medium text-cyan-200 underline-offset-2 hover:underline'
                onClick={() => {
                  if (!analyticsContext) return
                  trackGovernedEvent({
                    type: 'governed_related_question_click',
                    eventAction: 'click',
                    pageType: analyticsContext.pageType,
                    entityType: analyticsContext.entityType,
                    entitySlug: analyticsContext.entitySlug,
                    surfaceId: 'governed_related_questions',
                    componentType: 'related_questions_link',
                    item: item.questionType,
                    evidenceLabel: enrichment.pageEvidenceJudgment?.evidenceLabel,
                    safetySignalPresent:
                      enrichment.interactions.length > 0 ||
                      enrichment.contraindications.length > 0,
                    reviewedStatus: 'reviewed',
                    freshnessState: 'not_applicable',
                  })
                }}
              >
                {item.linkLabel}
              </a>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

function MonetizationInsertionZone({ zone }: { zone: string }) {
  return <div hidden data-profile-insertion-zone={zone} />
}

export default function GovernedResearchSections({
  enrichment,
  governedFaq,
  relatedQuestions,
  analyticsContext,
}: {
  enrichment: ResearchEnrichment
  governedFaq: GovernedFaqSectionContent
  relatedQuestions: GovernedRelatedQuestionsSection
  analyticsContext?: {
    pageType: GovernedPageType
    entityType: 'herb' | 'compound'
    entitySlug: string
  }
}) {
  const sections: ClaimSectionConfig[] = [
    {
      key: 'supportedUses',
      title: 'Supported uses',
      topicType: 'supported_use',
      items: enrichment.supportedUses,
      framing: 'The strongest use-case claims available in this governed profile layer, shown with evidence context instead of broad wellness language.',
    },
    {
      key: 'constituentsMechanisms',
      title: 'Mechanisms and active context',
      topicType: 'pathway',
      items: [...enrichment.constituents, ...enrichment.mechanisms],
      framing: 'Mechanism-level findings are grouped separately so proposed biological plausibility stays distinct from direct human outcome evidence.',
    },
    {
      key: 'unsupportedOrUnclearUses',
      title: 'Unsupported or unclear uses',
      topicType: 'unsupported_or_unclear_use',
      items: enrichment.unsupportedOrUnclearUses,
      framing: 'Claims with limited, unclear, or insufficient support are kept visible only when they add useful context.',
    },
    {
      key: 'dosageContextNotes',
      title: 'Dose and product-quality context',
      topicType: 'dosage_context_note',
      items: enrichment.dosageContextNotes,
      framing: 'Dose, preparation, population, and product-quality caveats that affect interpretation.',
    },
    {
      key: 'populationSpecificNotes',
      title: 'Population-specific cautions',
      topicType: 'population_specific_note',
      items: enrichment.populationSpecificNotes,
      framing: 'Context that may matter for specific populations or risk groups.',
    },
    {
      key: 'conflictNotes',
      title: 'Uncertainty and conflict notes',
      topicType: 'conflict_note',
      items: enrichment.conflictNotes,
      framing: 'Where the evidence is mixed, indirect, conflicting, or not yet mature enough for stronger conclusions.',
    },
    {
      key: 'researchGaps',
      title: 'Research gaps',
      topicType: 'research_gap',
      items: enrichment.researchGaps,
      framing: 'Open questions that should be resolved before stronger positioning or conversion modules are added.',
    },
  ]

  useEffect(() => {
    if (!analyticsContext) return
    trackGovernedEvent({
      type: 'governed_faq_visible',
      eventAction: 'visible',
      pageType: analyticsContext.pageType,
      entityType: analyticsContext.entityType,
      entitySlug: analyticsContext.entitySlug,
      surfaceId: 'governed_faq',
      componentType: 'faq_and_related_questions',
      evidenceLabel: enrichment.pageEvidenceJudgment?.evidenceLabel,
      safetySignalPresent:
        enrichment.interactions.length > 0 || enrichment.contraindications.length > 0,
      reviewedStatus: 'reviewed',
      freshnessState: 'not_applicable',
    })
  }, [analyticsContext, enrichment])

  return (
    <>
      <ProfileHeroV2 enrichment={enrichment} governedFaq={governedFaq} />
      <BestForFraming enrichment={enrichment} />
      <WhyItMatters enrichment={enrichment} governedFaq={governedFaq} />
      <PrimaryEffects enrichment={enrichment} />
      <MonetizationInsertionZone zone='affiliate-product-cards' />
      <EvidenceSafety enrichment={enrichment} governedFaq={governedFaq} />
      <MonetizationInsertionZone zone='stack-recommendations' />

      {hasProfileText(enrichment.evidenceSummary) && (
        <SectionShell id='governed-evidence-snapshot' eyebrow='Summary' title='Evidence summary'>
          <p className='max-w-3xl text-sm leading-relaxed text-white/84'>{enrichment.evidenceSummary}</p>
        </SectionShell>
      )}

      {governedFaq.whatWeKnow.length > 0 && (
        <SectionShell id='governed-what-we-know' eyebrow='Knowns' title='What we know'>
          <ul className='grid gap-2 sm:grid-cols-2'>
            {governedFaq.whatWeKnow.map(item => (
              <li key={item} className='rounded-2xl border border-white/12 bg-white/[0.025] px-3.5 py-3 text-sm leading-relaxed text-white/84'>
                {item}
              </li>
            ))}
          </ul>
        </SectionShell>
      )}

      {governedFaq.whatRemainsUncertain.length > 0 && (
        <SectionShell id='governed-uncertainty' eyebrow='Unknowns' title='What remains uncertain'>
          <ul className='grid gap-2 sm:grid-cols-2'>
            {governedFaq.whatRemainsUncertain.map(item => (
              <li key={item} className='rounded-2xl border border-amber-200/15 bg-amber-400/10 px-3.5 py-3 text-sm leading-relaxed text-amber-50/84'>
                {item}
              </li>
            ))}
          </ul>
        </SectionShell>
      )}

      {governedFaq.faqItems.length > 0 && (
        <SectionShell eyebrow='FAQ' title='Practical questions'>
          <div className='grid gap-3 md:grid-cols-2'>
            {governedFaq.faqItems.map(item => (
              <div key={`${item.questionType}:${item.question}`} className='rounded-2xl border border-white/12 bg-white/[0.025] p-4'>
                <p className='text-sm font-semibold text-white'>{item.question}</p>
                <p className='mt-2 text-sm leading-relaxed text-white/78'>{item.answer}</p>
              </div>
            ))}
          </div>
        </SectionShell>
      )}

      {sections.map(section => (
        <ClaimList
          key={section.key}
          items={section.items}
          topicType={section.topicType}
          title={section.title}
          framing={section.framing}
          enrichment={enrichment}
        />
      ))}

      <RelatedQuestions relatedQuestions={relatedQuestions} analyticsContext={analyticsContext} enrichment={enrichment} />
      <InternalDiscoveryRails enrichment={enrichment} />
      <MonetizationInsertionZone zone='protocol-comparison-modules' />

      <section className='border-white/8 mt-7 border-t pt-5'>
        <Collapse title='Sources & Provenance'>
          <div className='space-y-2 text-sm text-white/80'>
            <p>
              {enrichment.sourceRefs.length} source{enrichment.sourceRefs.length === 1 ? '' : 's'} · Last reviewed{' '}
              {new Date(enrichment.lastReviewedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <ol className='list-decimal space-y-1 pl-5'>
              {enrichment.sourceRefs.map(source => (
                <li key={source.sourceId}>
                  {source.url ? (
                    <a href={source.url} target='_blank' rel='noopener noreferrer' className='link'>
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                </li>
              ))}
            </ol>
          </div>
        </Collapse>
      </section>
    </>
  )
}
