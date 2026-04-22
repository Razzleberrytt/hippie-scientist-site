import { Link } from 'react-router-dom'
import type {
  EnrichmentRecommendation,
  EnrichmentRecommendationBundle,
  RecommendationSignalType,
} from '@/lib/enrichmentRecommendations'

type EntityNameLookup = {
  herb: Map<string, string>
  compound: Map<string, string>
}

type RecommendationSection = {
  id: string
  title: string
  description: string
  items: EnrichmentRecommendation[]
}

const SIGNAL_LABELS: Record<RecommendationSignalType, string> = {
  shared_supported_use: 'shared governed use-context',
  shared_safety_theme: 'shared safety signal',
  shared_mechanism_or_constituent: 'shared mechanism/constituent signal',
  herb_compound_relationship: 'explicit governed relationship',
  contrast_conflicting_or_uncertain: 'compare evidence uncertainty',
  evidence_strength_comparison: 'evidence-strength comparison',
}

function targetHref(item: EnrichmentRecommendation) {
  return item.targetType === 'herb'
    ? `/herbs/${encodeURIComponent(item.targetSlug)}`
    : `/compounds/${encodeURIComponent(item.targetSlug)}`
}

function targetName(item: EnrichmentRecommendation, names: EntityNameLookup) {
  return names[item.targetType].get(item.targetSlug) || item.targetSlug
}

export default function EnrichmentRecommendationBlocks({
  title,
  bundle,
  names,
  onRecommendationClick,
}: {
  title?: string
  bundle: EnrichmentRecommendationBundle
  names: EntityNameLookup
  onRecommendationClick?: (item: EnrichmentRecommendation, placement: string) => void
}) {
  const sections: RecommendationSection[] = [
    {
      id: 'enrichment-related-herbs',
      title: 'Related herbs (governed signals)',
      description:
        'These links are chosen from enrichment signals in the dataset and are intended for comparison, not endorsement.',
      items: bundle.relatedHerbs,
    },
    {
      id: 'enrichment-related-compounds',
      title: 'Related compounds (governed signals)',
      description:
        'Use these for mechanism and use-context exploration when governed enrichment coverage overlaps.',
      items: bundle.relatedCompounds,
    },
    {
      id: 'enrichment-compare-contrast',
      title: 'Compare & contrast evidence context',
      description:
        'These links help you compare stronger vs weaker, uncertain, or conflicting evidence patterns across governed pages.',
      items: bundle.compareContrast,
    },
    {
      id: 'enrichment-safety-next-steps',
      title: 'Safety-related next steps',
      description:
        'These pages share governed safety themes and can be reviewed before combining herbs or compounds.',
      items: bundle.safetyNextSteps,
    },
    {
      id: 'enrichment-mechanism-next-steps',
      title: 'Mechanism/constituent exploration',
      description:
        'These links are selected when governed mechanism or constituent themes overlap.',
      items: bundle.mechanismNextSteps,
    },
  ].filter(section => section.items.length > 0)

  if (sections.length === 0) return null

  return (
    <section className='border-white/8 mt-6 border-t pt-5'>
      <h2 className='mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>
        {title || 'Enrichment-aware recommendations'}
      </h2>
      <p className='mb-3 text-xs text-white/65'>
        Recommendation signals used:{' '}
        {bundle.activeSignals.map(signal => SIGNAL_LABELS[signal]).join(' · ')}.
      </p>
      <div className='space-y-3'>
        {sections.map(section => (
          <div key={section.id} className='rounded-xl border border-white/10 bg-white/[0.02] p-3'>
            <h3 className='text-sm font-semibold text-white'>{section.title}</h3>
            <p className='mt-1 text-xs text-white/65'>{section.description}</p>
            <ul className='mt-2 space-y-2 text-sm text-white/85'>
              {section.items.map(item => (
                <li key={`${section.id}-${item.targetType}-${item.targetSlug}-${item.signalType}`}>
                  <Link
                    className='link font-medium'
                    to={targetHref(item)}
                    onClick={() => onRecommendationClick?.(item, section.id)}
                  >
                    {targetName(item, names)}
                  </Link>
                  <span className='ml-2 text-xs text-white/60'>{item.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
