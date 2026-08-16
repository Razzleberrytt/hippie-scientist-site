import Link from 'next/link'
import type {
  GuideData,
  EvidenceLevel,
  SafetySeverity,
  GuideSection,
  GuideProductOption,
} from '@/lib/schemas/guide-schemas'
import InternalLinks from './InternalLinks'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const EVIDENCE_STYLES: Record<
  EvidenceLevel,
  { badge: string; rail: string; label: string }
> = {
  strong: {
    badge: 'bg-emerald-100 text-emerald-800',
    rail: 'border-l-emerald-500',
    label: 'Strong Evidence',
  },
  moderate: {
    badge: 'bg-blue-100 text-blue-800',
    rail: 'border-l-blue-500',
    label: 'Moderate Evidence',
  },
  limited: {
    badge: 'bg-amber-100 text-amber-800',
    rail: 'border-l-amber-500',
    label: 'Limited Evidence',
  },
  preliminary: {
    badge: 'bg-slate-100 text-slate-700',
    rail: 'border-l-slate-400',
    label: 'Preliminary',
  },
  traditional: {
    badge: 'bg-violet-100 text-violet-800',
    rail: 'border-l-violet-500',
    label: 'Traditional Use',
  },
}

const SAFETY_STYLES: Record<
  SafetySeverity,
  { bg: string; border: string; text: string; label: string }
> = {
  info: {
    bg: 'bg-blue-50/70',
    border: 'border-blue-200/50',
    text: 'text-blue-900',
    label: 'Note',
  },
  caution: {
    bg: 'bg-amber-50/70',
    border: 'border-amber-200/50',
    text: 'text-amber-950',
    label: 'Caution',
  },
  warning: {
    bg: 'bg-red-50/70',
    border: 'border-red-200/50',
    text: 'text-red-950',
    label: 'Warning',
  },
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

function SectionContent({ section }: { section: GuideSection }) {
  return (
    <section id={section.id} className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{section.title}</h2>
      <p className="text-sm leading-7 text-muted">{section.body}</p>
      {section.blocks?.map((block, i) => {
        if (block.type === 'tip') {
          return (
            <div
              key={i}
              className="rounded-xl border border-emerald-200/50 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900"
            >
              <strong className="font-semibold">Tip: </strong>
              {block.text}
            </div>
          )
        }
        if (block.type === 'warning') {
          return (
            <div
              key={i}
              className="rounded-xl border border-amber-200/50 bg-amber-50/60 px-4 py-3 text-sm text-amber-950"
            >
              <strong className="font-semibold">Note: </strong>
              {block.text}
            </div>
          )
        }
        return (
          <p key={i} className="text-sm leading-7 text-muted">
            {block.text}
          </p>
        )
      })}
      {section.subsections?.map((sub, i) => (
        <div key={i} className="space-y-2 border-l-2 border-brand-900/10 pl-4">
          <h3 className="text-lg font-semibold text-ink">{sub.title}</h3>
          <p className="text-sm leading-6 text-muted">{sub.body}</p>
          {sub.blocks?.map((block, j) => (
            <p key={j} className="text-sm leading-6 text-muted">
              {block.text}
            </p>
          ))}
        </div>
      ))}
    </section>
  )
}

function ProductOptions({ options }: { options: GuideProductOption[] }) {
  return (
    <section id="products" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">Product Options</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option) => (
          <article
            key={option.amazonAsin}
            className="rounded-xl border border-brand-900/10 bg-white/90 p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
              <span>{option.form}</span>
              <span className="text-muted">{option.approxPrice}</span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-ink">{option.name}</h3>
            <p className="mt-1 text-sm leading-6 text-muted">{option.description}</p>
            <dl className="mt-3 grid gap-2 text-xs text-muted">
              <div>
                <dt className="font-semibold text-ink">Typical dose</dt>
                <dd>{option.dosage}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Amazon rating</dt>
                <dd>{option.rating}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm leading-6 text-muted">{option.whyChosen}</p>
            <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <p className="font-semibold text-ink">Pros</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-muted">
                  {option.pros.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-ink">Cons</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-muted">
                  {option.cons.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <a
              href={option.amazonUrl}
              rel="nofollow sponsored noopener noreferrer"
              target="_blank"
              className="mt-4 inline-flex rounded-full bg-brand-700 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800"
            >
              View on Amazon
            </a>
          </article>
        ))}
      </div>
      <p className="text-xs text-muted">
        Affiliate disclosure: qualifying purchases may earn a commission at no extra cost to you.
      </p>
    </section>
  )
}

interface Props {
  guide: GuideData
}

export default function GuidePage({ guide }: Props) {
  const hasDosage = guide.dosageGuidelines && guide.dosageGuidelines.length > 0
  const hasOptions = guide.options && guide.options.length > 0
  const hasSafety = guide.safetyNotes && guide.safetyNotes.length > 0

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Hero remains the guide cover and primary visual anchor. */}
      <section className="overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white/90 shadow-sm">
        {guide.heroImage && (
          <div className="relative h-48 w-full overflow-hidden sm:h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={guide.heroImage}
              alt={guide.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
            <span className="rounded-full border border-brand-100/50 bg-brand-50 px-2.5 py-1 text-brand-700">
              {guide.category}
            </span>
            {guide.readingTime && (
              <span className="text-muted">{guide.readingTime} min read</span>
            )}
            <span className="text-muted">Updated {formatDate(guide.lastUpdated)}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {guide.title}
          </h1>
          {guide.subtitle && (
            <p className="mt-1 text-base font-medium text-brand-700">{guide.subtitle}</p>
          )}
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{guide.intro}</p>
        </div>
      </section>

      {/* Curated guide index. The aria-label also tells GlobalTOC to stand down. */}
      {guide.sections.length > 2 && (
        <nav
          aria-label="Table of contents"
          className="border-y border-[color:var(--hs-hairline-strong)] py-5"
        >
          <p className="eyebrow-label">In this guide</p>
          <ol className="mt-3 grid gap-x-6 sm:grid-cols-2">
            {guide.sections.map((sec, i) => (
              <li key={sec.id} className="border-t border-[color:var(--hs-hairline)] first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
                <a
                  href={`#${sec.id}`}
                  className="group flex min-h-11 items-baseline gap-3 py-2.5 text-sm text-[color:var(--hs-ink)] hover:text-[color:var(--tone-ink)]"
                >
                  <span className="font-display text-xs tabular-nums text-[color:var(--hs-gold)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="group-hover:underline group-hover:underline-offset-4">{sec.title}</span>
                </a>
              </li>
            ))}
            {hasDosage && (
              <li className="border-t border-[color:var(--hs-hairline)]">
                <a href="#dosage" className="group flex min-h-11 items-baseline gap-3 py-2.5 text-sm text-[color:var(--hs-ink)] hover:text-[color:var(--tone-ink)]">
                  <span className="font-display text-xs tabular-nums text-[color:var(--hs-gold)]">{String(guide.sections.length + 1).padStart(2, '0')}</span>
                  <span className="group-hover:underline group-hover:underline-offset-4">Dosage &amp; Forms</span>
                </a>
              </li>
            )}
            {hasSafety && (
              <li className="border-t border-[color:var(--hs-hairline)]">
                <a href="#safety" className="group flex min-h-11 items-baseline gap-3 py-2.5 text-sm text-[color:var(--hs-ink)] hover:text-[color:var(--tone-ink)]">
                  <span className="font-display text-xs tabular-nums text-[color:var(--hs-gold)]">
                    {String(guide.sections.length + (hasDosage ? 2 : 1)).padStart(2, '0')}
                  </span>
                  <span className="group-hover:underline group-hover:underline-offset-4">Safety &amp; Precautions</span>
                </a>
              </li>
            )}
            {hasOptions && (
              <li className="border-t border-[color:var(--hs-hairline)]">
                <a href="#products" className="group flex min-h-11 items-baseline gap-3 py-2.5 text-sm text-[color:var(--hs-ink)] hover:text-[color:var(--tone-ink)]">
                  <span className="font-display text-xs tabular-nums text-[color:var(--hs-gold)]">
                    {String(guide.sections.length + (hasDosage ? 1 : 0) + (hasSafety ? 1 : 0) + 1).padStart(2, '0')}
                  </span>
                  <span className="group-hover:underline group-hover:underline-offset-4">Product Options</span>
                </a>
              </li>
            )}
          </ol>
        </nav>
      )}

      {/* Evidence highlights become a scale-like ledger instead of mini-cards. */}
      {guide.evidenceHighlights.length > 0 && (
        <section className="space-y-3">
          <div>
            <p className="eyebrow-label">Evidence overview</p>
            <h2 className="mt-2 text-xl font-semibold text-[color:var(--hs-ink)]">What the evidence supports</h2>
          </div>
          <div className="divide-y divide-[color:var(--hs-hairline)] border-y border-[color:var(--hs-hairline-strong)]">
            {guide.evidenceHighlights.map((item, i) => {
              const style = EVIDENCE_STYLES[item.level]
              return (
                <div
                  key={`${item.claim}-${i}`}
                  className={`border-l-2 px-3 py-4 ${style.rail}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${style.badge}`}
                    >
                      {style.label}
                    </span>
                    <span className="font-display text-xs tabular-nums text-[color:var(--hs-gold)]" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[color:var(--hs-ink)]">{item.claim}</p>
                  {item.context && (
                    <p className="mt-1 max-w-3xl text-xs leading-5 text-[color:var(--hs-body)]">{item.context}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Main content sections */}
      {guide.sections.map((section) => (
        <SectionContent key={section.id} section={section} />
      ))}

      {/* Dosage guidelines */}
      {hasDosage && (
        <section id="dosage" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Dosage &amp; Forms</h2>
          <ResponsiveTable
            label={`${guide.title} dosage and forms`}
            className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white/90 shadow-sm"
          >
            <table className="min-w-full border-collapse text-sm">
              <caption className="sr-only">
                Dosage forms, typical ranges, and notes for {guide.title}
              </caption>
              <thead>
                <tr className="border-b border-brand-900/10 bg-brand-50/50">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                    Form
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                    Typical Range
                  </th>
                  <th scope="col" className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-brand-700 sm:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {guide.dosageGuidelines!.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-brand-900/5 last:border-0 hover:bg-brand-50/30"
                  >
                    <th scope="row" className="px-4 py-3 text-left font-medium text-ink">{row.form}</th>
                    <td className="px-4 py-3 text-muted">{row.range}</td>
                    <td className="hidden px-4 py-3 text-muted sm:table-cell">
                      {row.bioavailabilityNote ? (
                        <span className="text-brand-700">{row.bioavailabilityNote}</span>
                      ) : (
                        row.notes
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
          <p className="text-xs text-muted">
            Always start at the lower end of the range and consult a qualified healthcare provider
            before combining with medications.
          </p>
        </section>
      )}

      {/* Safety notes */}
      {hasSafety && (
        <section id="safety" className="scroll-mt-20 space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Safety &amp; Precautions
          </h2>
          {guide.safetyNotes!.map((note, i) => {
            const style = SAFETY_STYLES[note.severity]
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 text-sm leading-6 ${style.bg} ${style.border} ${style.text}`}
              >
                <strong className="font-semibold">{style.label}: </strong>
                {note.text}
              </div>
            )
          })}
        </section>
      )}

      {hasOptions && <ProductOptions options={guide.options!} />}

      {/* Internal links */}
      {guide.relatedLinks.length > 0 && (
        <InternalLinks links={guide.relatedLinks} heading="Explore Further" />
      )}

      {/* Bottom nav */}
      <div className="flex flex-wrap gap-4 border-t border-brand-900/10 pt-6 text-sm">
        <Link href="/guides/" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">
          ← All Guides
        </Link>
        <Link href="/herbs/" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">
          Herb Library →
        </Link>
      </div>
    </div>
  )
}
