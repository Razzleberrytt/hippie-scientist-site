import Collapse from '@/components/ui/Collapse'
import type { GovernedFaqSectionContent } from '@/lib/governedFaq'
import type { GovernedRelatedQuestionsSection } from '@/lib/governedRelatedQuestions'
import type { ResearchClaim, ResearchEnrichment } from '@/types/researchEnrichment'
import { getEvidenceLabelMeta, getTopicJudgment } from '@/lib/governedResearch'
import GovernedReviewFreshnessCard from '@/components/detail/GovernedReviewFreshnessCard'

type ClaimSectionConfig = {
  key: string
  title: string
  topicType: string
  items: ResearchClaim[]
}

function ClaimList({
  items,
  topicType,
  title,
  enrichment,
}: ClaimSectionConfig & { enrichment: ResearchEnrichment }) {
  if (!items.length) return null
  const judgment = getTopicJudgment(enrichment, topicType)
  const labelMeta = getEvidenceLabelMeta(judgment.evidenceLabel)

  return (
    <section className='border-white/8 mt-6 border-t pt-5'>
      <h2 className='mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>{title}</h2>
      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <span className={`rounded-full border px-3 py-1 text-xs ${labelMeta.className}`}>{labelMeta.title}</span>
        <span className='text-xs text-white/65'>{labelMeta.tone}</span>
      </div>
      <ul className='list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/85'>
        {items.map(item => (
          <li key={item.claim}>
            <span>{item.claim}</span>
            {item.strengthNote && <span className='block text-xs text-white/65'>{item.strengthNote}</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function GovernedResearchSections({
  enrichment,
  governedFaq,
  relatedQuestions,
}: {
  enrichment: ResearchEnrichment
  governedFaq: GovernedFaqSectionContent
  relatedQuestions: GovernedRelatedQuestionsSection
}) {
  const safetyEntries = enrichment.safetyProfile?.safetyEntries || []
  const sections: ClaimSectionConfig[] = [
    {
      key: 'supportedUses',
      title: 'Supported Uses',
      topicType: 'supported_use',
      items: enrichment.supportedUses,
    },
    {
      key: 'unsupportedOrUnclearUses',
      title: 'Unsupported or Unclear Uses',
      topicType: 'unsupported_or_unclear_use',
      items: enrichment.unsupportedOrUnclearUses,
    },
    {
      key: 'constituentsMechanisms',
      title: 'Constituents & Mechanisms',
      topicType: 'pathway',
      items: [...enrichment.constituents, ...enrichment.mechanisms],
    },
    {
      key: 'populationSpecificNotes',
      title: 'Population-Specific Cautions',
      topicType: 'population_specific_note',
      items: enrichment.populationSpecificNotes,
    },
    {
      key: 'conflictNotes',
      title: 'Uncertainty & Conflict Notes',
      topicType: 'conflict_note',
      items: enrichment.conflictNotes,
    },
    {
      key: 'researchGaps',
      title: 'Research Gaps',
      topicType: 'research_gap',
      items: enrichment.researchGaps,
    },
  ]

  return (
    <>
      <GovernedReviewFreshnessCard enrichment={enrichment} />

      <section id='governed-evidence-snapshot' className='mt-6 rounded-2xl border border-white/15 bg-white/[0.03] p-4'>
        <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-white/80'>
          Evidence snapshot
        </h2>
        <p className='mt-2 text-sm text-white/80'>{governedFaq.evidenceSnapshot}</p>
      </section>


      {relatedQuestions.items.length > 0 && (
        <section id='governed-related-questions' className='border-white/8 mt-6 border-t pt-5'>
          <h2 className='mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>
            Related questions people might search
          </h2>
          <div className='space-y-3'>
            {relatedQuestions.items.map(item => (
              <div key={item.questionType} className='rounded-xl border border-white/12 bg-white/[0.02] p-3'>
                <p className='text-sm font-semibold text-white'>{item.question}</p>
                <p className='mt-1 text-sm leading-relaxed text-white/80'>{item.answer}</p>
                {item.href && item.linkLabel && (
                  <a href={item.href} className='mt-2 inline-flex text-xs text-cyan-200 underline-offset-2 hover:underline'>
                    {item.linkLabel}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {governedFaq.whatWeKnow.length > 0 && (
        <section id='governed-what-we-know' className='border-white/8 mt-6 border-t pt-5'>
          <h2 className='mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>
            What we know
          </h2>
          <ul className='list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/85'>
            {governedFaq.whatWeKnow.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {governedFaq.whatRemainsUncertain.length > 0 && (
        <section id='governed-uncertainty' className='border-white/8 mt-6 border-t pt-5'>
          <h2 className='mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>
            What remains uncertain
          </h2>
          <ul className='list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/85'>
            {governedFaq.whatRemainsUncertain.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {governedFaq.keyCautions.length > 0 && (
        <section className='border-white/8 mt-6 border-t pt-5'>
          <h2 className='mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>
            Key cautions
          </h2>
          <ul className='space-y-2 text-sm leading-relaxed text-rose-100/95'>
            {governedFaq.keyCautions.map(item => (
              <li key={item} className='rounded-xl border border-rose-300/25 bg-rose-500/10 px-3 py-2'>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {governedFaq.faqItems.length > 0 && (
        <section className='border-white/8 mt-6 border-t pt-5'>
          <h2 className='mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>
            FAQ
          </h2>
          <div className='space-y-3'>
            {governedFaq.faqItems.map(item => (
              <div key={`${item.questionType}:${item.question}`} className='rounded-xl border border-white/12 bg-white/[0.02] p-3'>
                <p className='text-sm font-semibold text-white'>{item.question}</p>
                <p className='mt-1 text-sm leading-relaxed text-white/80'>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id='governed-safety-interactions' className='mt-6 rounded-2xl border border-rose-300/35 bg-rose-500/10 p-4'>
        <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-rose-100'>Safety & interactions first</h2>
        <p className='mt-2 text-sm text-rose-50/90'>
          Review cautions before considering any potential use claims. Evidence context can vary by population,
          dose, and product quality.
        </p>
        {(safetyEntries.length > 0 || enrichment.interactions.length > 0 || enrichment.contraindications.length > 0) && (
          <ul className='mt-3 space-y-2 text-sm text-rose-50/95'>
            {safetyEntries.map(entry => (
              <li key={entry.safetyEntryId} className='rounded-xl border border-rose-300/25 bg-black/20 px-3 py-2'>
                <span className='font-semibold'>{entry.targetName}:</span> {entry.findingTextShort}
              </li>
            ))}
            {enrichment.interactions.map(item => (
              <li key={item.claim} className='rounded-xl border border-rose-300/25 bg-black/20 px-3 py-2'>
                <span className='font-semibold'>Interaction:</span> {item.claim}
              </li>
            ))}
            {enrichment.contraindications.map(item => (
              <li key={item.claim} className='rounded-xl border border-rose-300/25 bg-black/20 px-3 py-2'>
                <span className='font-semibold'>Contraindication:</span> {item.claim}
              </li>
            ))}
            {enrichment.adverseEffects.map(item => (
              <li key={item.claim} className='rounded-xl border border-rose-300/25 bg-black/20 px-3 py-2'>
                <span className='font-semibold'>Adverse effect:</span> {item.claim}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className='border-white/8 mt-6 border-t pt-5'>
        <h2 className='mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>Evidence Summary</h2>
        <p className='text-sm text-white/85'>{enrichment.evidenceSummary}</p>
      </section>

      {sections
        .filter(section => section.items.length > 0)
        .map(section => (
          <ClaimList key={section.key} {...section} enrichment={enrichment} />
        ))}

      <section className='border-white/8 mt-6 border-t pt-5'>
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
                    <a href={source.url} target='_blank' rel='noreferrer' className='link'>
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
