import Link from 'next/link'
import { BookOpen, ExternalLink, ShieldCheck } from 'lucide-react'

import {
  assertCompleteProfileTranslation,
  getApprovedCanonicalClaims,
  sourcesForApprovedClaims,
  type CanonicalLocalizedProfile,
  type LocalizedProfileTranslation,
  type LocalizedProfileUiCopy,
} from '@/src/lib/localized-profile'

function confidencePercent(value?: number) {
  return typeof value === 'number' ? `${Math.round(value * 100)}%` : null
}

export default function LocalizedResearchProfilePage({
  canonical,
  translation,
  ui,
  lang,
  libraryHref,
}: {
  canonical: CanonicalLocalizedProfile
  translation: LocalizedProfileTranslation
  ui: LocalizedProfileUiCopy
  lang: string
  libraryHref: string
}) {
  assertCompleteProfileTranslation(canonical, translation)
  const claims = getApprovedCanonicalClaims(canonical)
  const safetyClaims = claims.filter((claim) => claim.predicate === 'has_safety_warning')
  const evidenceClaims = claims.filter((claim) => claim.predicate !== 'has_safety_warning')
  const sources = sourcesForApprovedClaims(canonical)

  return (
    <article className='mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16 lg:px-10' lang={lang}>
      <header className='rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-card-strong)] p-6 shadow-[0_18px_48px_rgba(45,35,19,0.08)] sm:p-10'>
        <p className='text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--hs-gold)]'>{ui.evidenceEyebrow}</p>
        <h1 className='mt-4 font-display text-4xl font-semibold tracking-[-0.035em] text-[var(--text-primary)] sm:text-5xl'>{translation.title}</h1>
        <p className='mt-6 max-w-3xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg'>{translation.summary}</p>
        <div className='mt-6 flex flex-wrap gap-3 text-sm'>
          <Link href={libraryHref} className='rounded-full border border-[var(--border-soft)] px-4 py-2 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]'>
            {ui.backToLibraryLabel}
          </Link>
          <Link href={translation.originalPath} hrefLang='en-US' className='rounded-full border border-[var(--border-soft)] px-4 py-2 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]'>
            {ui.originalLabel}
          </Link>
        </div>
      </header>

      <section className='mt-8 rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 sm:p-8'>
        <div className='flex items-start gap-3'>
          <BookOpen className='mt-1 h-5 w-5 shrink-0 text-[var(--hs-gold)]' aria-hidden='true' />
          <div>
            <h2 className='font-display text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl'>{ui.evidenceHeading}</h2>
            <p className='mt-2 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]'>{ui.evidenceIntro}</p>
          </div>
        </div>
        <div className='mt-6 space-y-4'>
          {evidenceClaims.map((claim) => (
            <div key={claim.id} className='rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-5'>
              <p className='leading-7 text-[var(--text-primary)]'>{translation.claims[claim.id]}</p>
              <div className='mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]'>
                {claim.evidenceLevel ? <span>{ui.evidenceLevelLabel}: {claim.evidenceLevel}</span> : null}
                {confidencePercent(claim.confidence) ? <span>{ui.confidenceLabel}: {confidencePercent(claim.confidence)}</span> : null}
                {claim.sourceRefIds?.length ? <span>{ui.sourceLabel}: {claim.sourceRefIds.length}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {(translation.safetyNotes || safetyClaims.length || translation.contraindications?.length) ? (
        <section className='mt-8 rounded-[1.75rem] border border-[var(--border-strong)] border-l-4 border-l-[color:var(--hs-gold)] bg-[var(--surface-warning)] p-6 sm:p-8'>
          <div className='flex items-center gap-3'>
            <ShieldCheck className='h-5 w-5 text-[var(--hs-gold)]' aria-hidden='true' />
            <h2 className='font-display text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl'>{ui.safetyHeading}</h2>
          </div>
          {translation.safetyNotes ? <p className='mt-4 leading-7 text-[var(--text-secondary)]'>{translation.safetyNotes}</p> : null}
          {safetyClaims.length ? (
            <div className='mt-5 space-y-3'>
              {safetyClaims.map((claim) => (
                <p key={claim.id} className='rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4 leading-7 text-[var(--text-primary)]'>
                  {translation.claims[claim.id]}
                </p>
              ))}
            </div>
          ) : null}
          {translation.contraindications?.length ? (
            <ul className='mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--text-secondary)]'>
              {translation.contraindications.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : null}
        </section>
      ) : null}

      {translation.dosage ? (
        <section className='mt-8 rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 sm:p-8'>
          <h2 className='font-display text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl'>{ui.dosageHeading}</h2>
          <p className='mt-4 leading-7 text-[var(--text-secondary)]'>{translation.dosage}</p>
        </section>
      ) : null}

      <section className='mt-8 rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 sm:p-8'>
        <h2 className='font-display text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl'>{ui.sourcesHeading}</h2>
        <p className='mt-2 text-sm leading-7 text-[var(--text-secondary)]'>{ui.sourcesIntro}</p>
        <ol className='mt-5 space-y-3'>
          {sources.map((source, index) => (
            <li key={source.id ?? `${source.title}-${index}`} className='rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4 text-sm leading-6 text-[var(--text-secondary)]'>
              <span className='font-semibold text-[var(--text-primary)]'>{index + 1}. {source.title ?? 'Source'}</span>
              {[source.journal, source.year].filter(Boolean).length ? <span className='ml-2'>({[source.journal, source.year].filter(Boolean).join(', ')})</span> : null}
              {source.url ? (
                <a href={source.url} target='_blank' rel='noopener noreferrer' className='ml-2 inline-flex items-center gap-1 font-semibold text-[var(--hs-gold)] hover:underline'>
                  <ExternalLink className='h-3.5 w-3.5' aria-hidden='true' />
                  {ui.sourceLabel}
                </a>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <p className='mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-[var(--text-muted)]'>{ui.educationalDisclaimer}</p>
    </article>
  )
}
