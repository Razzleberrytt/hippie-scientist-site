import type { Metadata } from 'next'
import Link from 'next/link'

import { EVIDENCE_STUDY_CLASS_DEFINITIONS } from '@/lib/evidence-study'
import {
  getPublicEvidenceDataset,
  type PublicStudyEntity,
} from '@/lib/public-evidence-dataset'
import { buildPageMetadata } from '@/lib/seo'
import { getResearchSourceRegisterSummary } from '@/lib/research-source-register'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Research Library | Studies, Trials & Evidence Sources',
  description:
    'Find supplement studies, ingredient evidence, methodology, reports, public datasets, and direct PubMed or DOI source links from one research hub.',
  path: '/research/',
})

const researchPaths = [
  {
    eyebrow: 'Find a paper',
    title: 'Search citations',
    href: '/learn/citation-explorer/',
    description: 'Search the study-level index and open the PubMed, DOI, or original source behind a research record.',
  },
  {
    eyebrow: 'Check an ingredient',
    title: 'Look up the evidence',
    href: '/evidence/evidence-checker/',
    description: 'Start from a herb or compound and inspect its evidence grade, source coverage, and safety context.',
  },
  {
    eyebrow: 'See the big picture',
    title: 'Open the Evidence Report',
    href: '/evidence/evidence-report/',
    description: 'Review library-wide evidence metrics, grade distribution, ambiguity analysis, and the public dataset.',
  },
] as const

const secondaryResearchLinks = [
  {
    label: 'Methodology',
    href: '/info/methodology/',
  },
  {
    label: 'Research operations',
    href: '/research/operations/',
  },
  {
    label: 'Recent evidence changes',
    href: '/updates/',
  },
] as const

const externalResearchResources = [
  {
    name: 'PubMed',
    href: 'https://pubmed.ncbi.nlm.nih.gov/',
    description: 'Biomedical and life-science literature indexed by the U.S. National Library of Medicine.',
  },
  {
    name: 'ClinicalTrials.gov',
    href: 'https://clinicaltrials.gov/',
    description: 'Registered and completed clinical studies, including many supplement and botanical trials.',
  },
  {
    name: 'Cochrane Library',
    href: 'https://www.cochranelibrary.com/',
    description: 'Systematic reviews and evidence syntheses built around predefined review methods.',
  },
  {
    name: 'NIH Office of Dietary Supplements',
    href: 'https://ods.od.nih.gov/factsheets/list-all/',
    description: 'Government fact sheets with nutrient evidence, safety context, and source trails.',
  },
] as const

const REVIEW_CLASSES = new Set<string>(['meta_analysis', 'systematic_review', 'narrative_review'])
const TRIAL_CLASSES = new Set<string>(['randomized_controlled_trial', 'controlled_trial'])
const HUMAN_CONTEXT_CLASSES = new Set<string>(['observational', 'case_report'])
const PRECLINICAL_CLASSES = new Set<string>(['mechanistic', 'animal', 'in_vitro'])

function cleanDoi(doi: string) {
  return doi
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
}

function sourceHref(study: PublicStudyEntity) {
  const pmid = study.pmid?.trim()
  if (pmid) return 'https://pubmed.ncbi.nlm.nih.gov/' + encodeURIComponent(pmid) + '/'

  const doi = study.doi?.trim()
  if (doi) return 'https://doi.org/' + cleanDoi(doi)

  const url = study.url?.trim()
  if (url && /^https?:\/\//i.test(url)) return url

  return null
}

function sourceLabel(study: PublicStudyEntity) {
  if (study.pmid?.trim()) return 'PubMed · PMID ' + study.pmid.trim()
  if (study.doi?.trim()) return 'DOI · ' + cleanDoi(study.doi)
  return 'Original source'
}

function studyYear(study: PublicStudyEntity) {
  if (typeof study.year === 'number') return study.year
  const value = Number(study.year)
  return Number.isFinite(value) ? value : 0
}

function rankStudies(studies: PublicStudyEntity[]) {
  return [...studies].sort((a, b) => {
    const rankA = EVIDENCE_STUDY_CLASS_DEFINITIONS[a.evidenceClass]?.hierarchyRank ?? 0
    const rankB = EVIDENCE_STUDY_CLASS_DEFINITIONS[b.evidenceClass]?.hierarchyRank ?? 0
    if (rankA !== rankB) return rankB - rankA

    const yearDifference = studyYear(b) - studyYear(a)
    if (yearDifference !== 0) return yearDifference

    return a.title.localeCompare(b.title)
  })
}

function compactStudyContext(study: PublicStudyEntity) {
  const context = [study.population, study.outcome, study.result]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' · ')

  if (!context) return ''
  return context.length > 180 ? context.slice(0, 177).trimEnd() + '…' : context
}

function StudySourceCard({ study }: { study: PublicStudyEntity }) {
  const href = sourceHref(study)
  if (!href) return null

  const classLabel = EVIDENCE_STUDY_CLASS_DEFINITIONS[study.evidenceClass]?.label ?? 'Research record'
  const ingredientNames = [...new Set(study.relationships.map((relationship) => relationship.ingredientName))]
    .filter(Boolean)
    .slice(0, 2)
    .join(', ')
  const context = compactStudyContext(study)

  return (
    <article className='flex h-full flex-col rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
      <p className='text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700'>
        {classLabel}{studyYear(study) > 0 ? ' · ' + studyYear(study) : ''}
      </p>
      <h3 className='mt-3 text-base font-semibold leading-6 text-ink'>{study.title}</h3>
      <p className='mt-2 text-xs leading-5 text-muted'>
        {[study.journal, ingredientNames].filter(Boolean).join(' · ') || 'Structured research record'}
      </p>
      {context ? <p className='mt-3 text-xs leading-5 text-muted'>{context}</p> : null}
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className='mt-auto pt-5 text-sm font-semibold text-brand-700 hover:underline'
      >
        {sourceLabel(study)} ↗
      </a>
    </article>
  )
}

function firstStudy(studies: PublicStudyEntity[], classes: Set<string>) {
  return studies.find((study) => classes.has(study.evidenceClass))
}

export default async function ResearchPage() {
  const dataset = await getPublicEvidenceDataset()
  const sourceRegister = getResearchSourceRegisterSummary()
  const directlyLinkedStudies = rankStudies(dataset.studies.filter((study) => Boolean(sourceHref(study))))

  const seeded = [
    firstStudy(directlyLinkedStudies, REVIEW_CLASSES),
    firstStudy(directlyLinkedStudies, TRIAL_CLASSES),
    firstStudy(directlyLinkedStudies, HUMAN_CONTEXT_CLASSES),
    firstStudy(directlyLinkedStudies, PRECLINICAL_CLASSES),
  ].filter((study): study is PublicStudyEntity => Boolean(study))

  const seededIds = new Set(seeded.map((study) => study.id))
  const featuredStudies = [
    ...seeded,
    ...directlyLinkedStudies.filter((study) => !seededIds.has(study.id)),
  ].slice(0, 6)

  return (
    <div className='research-page-content mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8'>
      <section className='overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Research</p>
        <h1 className='mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          What are you trying to verify?
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Start with the research task, not a wall of cards. Find a source, check an ingredient, or inspect the full evidence picture.
        </p>
      </section>

      <section aria-labelledby='research-paths-heading'>
        <div className='max-w-3xl'>
          <p className='eyebrow-label'>Choose a path</p>
          <h2 id='research-paths-heading' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
            Three jobs, three clear destinations.
          </h2>
        </div>
        <div className='mt-6 grid gap-4 md:grid-cols-3'>
          {researchPaths.map((path) => (
            <Link
              key={path.href}
              href={path.href}
              className='card-premium block p-6 transition hover:border-brand-700/30 hover:bg-brand-50/30'
            >
              <p className='eyebrow-label'>{path.eyebrow}</p>
              <h3 className='mt-2 text-xl font-semibold text-ink'>{path.title}</h3>
              <p className='mt-3 text-sm leading-7 text-muted'>{path.description}</p>
              <span className='mt-4 inline-flex text-sm font-semibold text-brand-700'>Open →</span>
            </Link>
          ))}
        </div>

        <div className='mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-900/10 bg-brand-50/50 px-4 py-3 text-sm'>
          <p className='max-w-3xl text-muted'><strong className='text-ink'>{sourceRegister.totalIndexedPmids.toLocaleString()} unique research-only PubMed references</strong> are cataloged separately from the editorially reviewed evidence.</p>
          <Link href='/research/source-register/' className='font-semibold text-brand-700 hover:underline'>Browse source register →</Link>
        </div>
        <div className='mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-brand-900/10 bg-white/70 px-4 py-3 text-sm'>
          <span className='font-semibold text-ink'>Trust & updates</span>
          {secondaryResearchLinks.map((link) => (
            <Link key={link.href} href={link.href} className='font-semibold text-brand-700 hover:underline'>
              {link.label} →
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby='featured-research-heading'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='max-w-3xl'>
            <p className='eyebrow-label'>Source sample</p>
            <h2 id='featured-research-heading' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
              A small cross-section of the source index
            </h2>
            <p className='mt-3 text-sm leading-7 text-muted'>
              These examples deliberately mix review, trial, human-context, and preclinical records. The complete citation index stays in the Citation Explorer instead of being duplicated on this hub.
            </p>
          </div>
          <Link href='/learn/citation-explorer/' className='text-sm font-semibold text-brand-700 hover:underline'>
            Search all citations →
          </Link>
        </div>
        <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {featuredStudies.map((study) => (
            <StudySourceCard key={study.id} study={study} />
          ))}
        </div>
      </section>

      <section
        className='rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8'
        aria-labelledby='external-databases-heading'
      >
        <p className='eyebrow-label'>Independent databases</p>
        <h2 id='external-databases-heading' className='mt-2 text-2xl font-semibold text-ink'>
          Verify outside this site
        </h2>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-muted'>
          The research trail should remain useful even when you leave The Hippie Scientist.
        </p>
        <div className='mt-6 grid gap-3 sm:grid-cols-2'>
          {externalResearchResources.map((resource) => (
            <a
              key={resource.href}
              href={resource.href}
              target='_blank'
              rel='noopener noreferrer'
              className='rounded-xl border border-brand-900/10 p-4 transition hover:border-brand-700/30 hover:bg-brand-50/40'
            >
              <span className='font-semibold text-ink'>{resource.name} ↗</span>
              <span className='mt-1 block text-xs leading-5 text-muted'>{resource.description}</span>
            </a>
          ))}
        </div>
      </section>

      <section
        className='rounded-2xl border border-brand-900/10 bg-brand-50/45 p-6 sm:p-8'
        aria-labelledby='library-data-heading'
      >
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='eyebrow-label'>Public data · dataset v{dataset.datasetVersion}</p>
            <h2 id='library-data-heading' className='mt-2 text-2xl font-semibold text-ink'>
              Library scale and downloads
            </h2>
          </div>
          <Link href='/evidence/evidence-report/' className='text-sm font-semibold text-brand-700 hover:underline'>
            Full Evidence Report →
          </Link>
        </div>
        <p className='mt-4 text-sm leading-7 text-muted'>
          Separately, the research intake register tracks <strong className='text-ink'>{sourceRegister.totalIndexedPmids.toLocaleString()}</strong> distinct PubMed IDs through wave {sourceRegister.throughWave.toLocaleString()}. Those identities are not added to the published study counts below. <Link href='/research/source-register/' className='font-semibold text-brand-700 hover:underline'>Browse source intake →</Link> <Link href='/research/intelligence/' className='font-semibold text-brand-700 hover:underline'>Explore the Research Intelligence Studio ↗</Link>
        </p>
        <div className='mt-6 grid gap-4 sm:grid-cols-3'>
          <div className='rounded-xl bg-white p-5'>
            <p className='text-3xl font-bold text-ink'>{dataset.metrics.studyCount.toLocaleString()}</p>
            <p className='mt-1 text-xs leading-5 text-muted'>structured study records</p>
          </div>
          <div className='rounded-xl bg-white p-5'>
            <p className='text-3xl font-bold text-ink'>{dataset.metrics.humanStudyCount.toLocaleString()}</p>
            <p className='mt-1 text-xs leading-5 text-muted'>human-evidence records</p>
          </div>
          <div className='rounded-xl bg-white p-5'>
            <p className='text-3xl font-bold text-ink'>{directlyLinkedStudies.length.toLocaleString()}</p>
            <p className='mt-1 text-xs leading-5 text-muted'>records with a direct source link</p>
          </div>
        </div>
        <div className='mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm'>
          <a href='/evidence/evidence-report/dataset.csv' className='font-semibold text-brand-700 hover:underline'>Download CSV</a>
          <a href='/evidence/evidence-report/dataset.json' className='font-semibold text-brand-700 hover:underline'>Download JSON</a>
          <Link href='/info/methodology/' className='font-semibold text-brand-700 hover:underline'>Methodology</Link>
        </div>
      </section>
    </div>
  )
}
