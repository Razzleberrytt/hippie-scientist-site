import type { Metadata } from 'next'
import Link from 'next/link'

import { EVIDENCE_STUDY_CLASS_DEFINITIONS } from '@/lib/evidence-study'
import {
  getPublicEvidenceDataset,
  type PublicStudyEntity,
} from '@/lib/public-evidence-dataset'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Research Library | Studies, Trials & Evidence Sources',
  description:
    'Browse directly linked supplement research, human trials, systematic reviews, PubMed and DOI sources, evidence tools, methodology, and downloadable datasets from The Hippie Scientist.',
  path: '/research/',
})

const externalResearchResources = [
  {
    name: 'PubMed',
    href: 'https://pubmed.ncbi.nlm.nih.gov/',
    description:
      'Search biomedical and life-science literature indexed by the U.S. National Library of Medicine.',
  },
  {
    name: 'ClinicalTrials.gov',
    href: 'https://clinicaltrials.gov/',
    description:
      'Search registered and completed clinical studies, including many supplement and botanical trials.',
  },
  {
    name: 'Cochrane Library',
    href: 'https://www.cochranelibrary.com/',
    description:
      'Find systematic reviews and evidence syntheses built around predefined review methods.',
  },
  {
    name: 'NIH Office of Dietary Supplements',
    href: 'https://ods.od.nih.gov/factsheets/list-all/',
    description:
      'Use NIH fact sheets as a starting point for nutrient evidence, safety context, and source trails.',
  },
]

const researchTools = [
  {
    eyebrow: 'Study-level source trail',
    title: 'Citation Explorer',
    href: '/learn/citation-explorer/',
    description:
      'Search structured study records and follow the evidence back to the ingredient pages and source identifiers that use them.',
  },
  {
    eyebrow: 'Ingredient-level evidence',
    title: 'Evidence Database',
    href: '/evidence/evidence-checker/',
    description:
      'Look up an ingredient and inspect its current evidence grade, source coverage, safety context, and research maturity.',
  },
  {
    eyebrow: 'Visual research map',
    title: 'Botanical Activity Atlas',
    href: '/tools/botanical-activity-atlas/',
    description:
      'Explore how botanicals, compounds, pathways, and evidence relationships connect across the research library.',
  },
  {
    eyebrow: 'Aggregate analysis',
    title: 'State of Supplement Evidence',
    href: '/evidence/evidence-report/',
    description:
      'See the library-wide metrics, evidence-grade distribution, ambiguity analysis, and downloadable public dataset.',
  },
]

function cleanDoi(doi: string) {
  return doi
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
}

function sourceHref(study: PublicStudyEntity) {
  const pmid = study.pmid?.trim()
  if (pmid) return `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(pmid)}/`

  const doi = study.doi?.trim()
  if (doi) return `https://doi.org/${cleanDoi(doi)}`

  const url = study.url?.trim()
  if (url && /^https?:\/\//i.test(url)) return url

  return null
}

function sourceLabel(study: PublicStudyEntity) {
  if (study.pmid?.trim()) return `PubMed · PMID ${study.pmid.trim()}`
  if (study.doi?.trim()) return `DOI · ${cleanDoi(study.doi)}`
  return 'Open source'
}

function studyYear(study: PublicStudyEntity) {
  if (typeof study.year === 'number') return study.year
  const value = Number(study.year)
  return Number.isFinite(value) ? value : 0
}

function relationshipLabel(study: PublicStudyEntity) {
  switch (study.relationshipSummary) {
    case 'supports':
      return 'Supportive finding'
    case 'mixed':
      return 'Mixed findings'
    case 'contradicts':
      return 'Unfavorable finding'
    case 'no_clear_effect':
      return 'No clear effect'
    default:
      return 'Background evidence'
  }
}

function gradePriority(grade: string) {
  if (grade === 'A') return 0
  if (grade === 'B') return 1
  if (grade === 'C') return 2
  if (grade === 'D') return 3
  if (grade === 'Avoid/Insufficient') return 4
  return 5
}

export default async function ResearchPage() {
  const dataset = await getPublicEvidenceDataset()

  const directlyLinkedStudies = [...dataset.studies]
    .filter((study) => Boolean(sourceHref(study)))
    .sort((a, b) => {
      const rankA = EVIDENCE_STUDY_CLASS_DEFINITIONS[a.evidenceClass]?.hierarchyRank ?? 0
      const rankB = EVIDENCE_STUDY_CLASS_DEFINITIONS[b.evidenceClass]?.hierarchyRank ?? 0
      if (rankA !== rankB) return rankB - rankA
      const yearDifference = studyYear(b) - studyYear(a)
      if (yearDifference !== 0) return yearDifference
      return a.title.localeCompare(b.title)
    })
    .slice(0, 12)

  const strongestIngredients = [...dataset.ingredients]
    .filter((ingredient) => ingredient.evidenceGrade === 'A' || ingredient.evidenceGrade === 'B')
    .sort((a, b) => {
      const gradeDifference = gradePriority(a.evidenceGrade) - gradePriority(b.evidenceGrade)
      return gradeDifference || a.name.localeCompare(b.name)
    })
    .slice(0, 18)

  const directSourceCount = dataset.studies.filter((study) => Boolean(sourceHref(study))).length

  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="eyebrow-label">Research library · sources first</p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Follow the evidence all the way back to the research.
        </h1>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-muted">
          This is the front door to The Hippie Scientist research system: directly linked papers, human trials,
          reviews, structured citation records, evidence tools, methodology, and public research data. Start with
          the studies themselves; use grades and metrics as context, not as a substitute for reading the evidence.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/learn/citation-explorer/"
            className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900"
          >
            Browse studies
          </Link>
          <Link
            href="/evidence/evidence-checker/"
            className="rounded-full border border-brand-900/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            Search an ingredient
          </Link>
          <Link
            href="/info/methodology/"
            className="rounded-full border border-brand-900/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            Read the methodology
          </Link>
        </div>
      </section>

      <section aria-labelledby="direct-research-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-label">Direct research links</p>
            <h2 id="direct-research-heading" className="mt-2 text-3xl font-semibold tracking-tight text-ink">
              Open the papers, not just our summaries
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              These records are selected by study-design strength and recency from the current public evidence
              dataset. Supportive, mixed, null, and unfavorable findings are all eligible; this is not a positive-results showcase.
            </p>
          </div>
          <Link href="/learn/citation-explorer/" className="text-sm font-semibold text-brand-700 hover:underline">
            Search all indexed citations →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {directlyLinkedStudies.map((study) => {
            const href = sourceHref(study)
            const classLabel = EVIDENCE_STUDY_CLASS_DEFINITIONS[study.evidenceClass]?.label ?? 'Research record'
            const ingredientNames = [...new Set(study.relationships.map((relationship) => relationship.ingredientName))]
              .slice(0, 3)
              .join(', ')

            return (
              <article key={study.id} className="card-premium flex h-full flex-col p-5">
                <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
                  <span>{classLabel}</span>
                  {studyYear(study) > 0 ? <span>· {studyYear(study)}</span> : null}
                </div>
                <h3 className="mt-3 text-base font-semibold leading-6 text-ink">{study.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {[study.journal, ingredientNames].filter(Boolean).join(' · ') || 'Structured research record'}
                </p>
                <p className="mt-3 text-xs font-semibold text-muted">{relationshipLabel(study)}</p>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-5 text-sm font-semibold text-brand-700 hover:underline"
                  >
                    {sourceLabel(study)} ↗
                  </a>
                ) : null}
              </article>
            )
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]" aria-labelledby="evidence-strongest-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Where the evidence is strongest</p>
          <h2 id="evidence-strongest-heading" className="mt-2 text-2xl font-semibold text-ink">
            Start with the A/B evidence profiles
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            These are the current indexable ingredient profiles graded Strong (A) or Moderate (B). A grade is a
            navigation aid, not a guarantee of benefit, and different outcomes or preparations can have different evidence.
          </p>
          {strongestIngredients.length > 0 ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {strongestIngredients.map((ingredient) => (
                <Link
                  key={`${ingredient.type}-${ingredient.slug}`}
                  href={ingredient.path}
                  className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 transition hover:border-brand-700/30 hover:bg-brand-50"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                    Grade {ingredient.evidenceGrade} · {ingredient.type}
                  </span>
                  <span className="mt-1 block font-semibold text-ink">{ingredient.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">No A/B profiles are currently available in the public dataset.</p>
          )}
        </div>

        <aside className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-6 sm:p-8">
          <p className="eyebrow-label">A better way to read C</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">C means limited evidence — not “disproven.”</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            The canonical grading system defines C as <strong className="text-ink">Limited Evidence</strong>. It is
            intentionally separated from D (Preliminary / Theoretical) and Avoid / Insufficient. A large C band can
            reflect a research field where signals exist but the evidence base is not yet strong or consistent enough for B or A.
          </p>
          <Link href="/info/methodology/" className="mt-5 inline-flex text-sm font-semibold text-brand-700 hover:underline">
            How evidence is graded →
          </Link>
        </aside>
      </section>

      <section aria-labelledby="research-tools-heading">
        <p className="eyebrow-label">Research tools</p>
        <h2 id="research-tools-heading" className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Move from question → evidence → source
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {researchTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="card-premium block p-6 transition hover:border-brand-700/30 hover:bg-brand-50/30"
            >
              <p className="eyebrow-label">{tool.eyebrow}</p>
              <h3 className="mt-2 text-xl font-semibold text-ink">{tool.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{tool.description}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-brand-700">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="external-databases-heading">
        <p className="eyebrow-label">Independent research databases</p>
        <h2 id="external-databases-heading" className="mt-2 text-2xl font-semibold text-ink">
          Verify beyond The Hippie Scientist
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Good research should be easy to check elsewhere. These external databases are useful for finding primary
          papers, trial registrations, reviews, and government evidence summaries.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {externalResearchResources.map((resource) => (
            <a
              key={resource.href}
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-brand-900/10 p-4 transition hover:border-brand-700/30 hover:bg-brand-50/40"
            >
              <span className="font-semibold text-ink">{resource.name} ↗</span>
              <span className="mt-1 block text-xs leading-5 text-muted">{resource.description}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/45 p-6 sm:p-8" aria-labelledby="library-context-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-label">Library context · dataset v{dataset.datasetVersion}</p>
            <h2 id="library-context-heading" className="mt-2 text-2xl font-semibold text-ink">
              The numbers belong here — as context
            </h2>
          </div>
          <Link href="/evidence/evidence-report/" className="text-sm font-semibold text-brand-700 hover:underline">
            Open the full Evidence Report →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-ink">{dataset.metrics.studyCount.toLocaleString()}</p>
            <p className="mt-1 text-xs leading-5 text-muted">deduplicated structured study records</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-ink">{dataset.metrics.humanStudyCount.toLocaleString()}</p>
            <p className="mt-1 text-xs leading-5 text-muted">human-evidence source records</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-ink">{directSourceCount.toLocaleString()}</p>
            <p className="mt-1 text-xs leading-5 text-muted">study records with a direct PubMed, DOI, or source URL</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a href="/evidence/evidence-report/dataset.csv" className="font-semibold text-brand-700 hover:underline">
            Download CSV
          </a>
          <a href="/evidence/evidence-report/dataset.json" className="font-semibold text-brand-700 hover:underline">
            Download JSON
          </a>
          <Link href="/info/methodology/" className="font-semibold text-brand-700 hover:underline">
            Methodology
          </Link>
          <Link href="/evidence/evidence-digest/" className="font-semibold text-brand-700 hover:underline">
            Evidence digest
          </Link>
        </div>
      </section>
    </main>
  )
}
