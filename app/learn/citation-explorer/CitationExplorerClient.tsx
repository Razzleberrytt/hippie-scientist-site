'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  evidenceRelationshipLabel,
  formatEvidenceStudyClass,
  parseSampleSize,
  type EvidenceRelationship,
  type EvidenceStudyClass,
} from '@/lib/evidence-study'
import type { PublicStudyEntity } from '@/lib/public-evidence-dataset'

type Props = { studies: PublicStudyEntity[] }
const PAGE_SIZE = 50

function anchorId(studyId: string) {
  return `study-${studyId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

function sourceUrl(study: PublicStudyEntity) {
  if (study.url) return study.url
  if (study.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`
  if (study.doi) return `https://doi.org/${study.doi}`
  return ''
}

function relationTone(value: EvidenceRelationship) {
  if (value === 'supports') return 'border-emerald-600/20 bg-emerald-50 text-emerald-800'
  if (value === 'contradicts') return 'border-rose-600/20 bg-rose-50 text-rose-800'
  if (value === 'mixed' || value === 'no_clear_effect') return 'border-amber-600/20 bg-amber-50 text-amber-800'
  return 'border-brand-900/10 bg-brand-50 text-muted'
}

export default function CitationExplorerClient({ studies }: Props) {
  const [query, setQuery] = useState('')
  const [ingredient, setIngredient] = useState('')
  const [condition, setCondition] = useState('')
  const [studyClass, setStudyClass] = useState('')
  const [year, setYear] = useState('')
  const [grade, setGrade] = useState('')
  const [minSample, setMinSample] = useState('')
  const [duration, setDuration] = useState('')
  const [safety, setSafety] = useState('')
  const [relationship, setRelationship] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const ingredientOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const study of studies) {
      for (const relation of study.relationships) map.set(relation.ingredientSlug, relation.ingredientName)
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [studies])
  const conditionOptions = useMemo(() => [...new Set(studies.flatMap(study => study.conditions))].sort(), [studies])
  const classOptions = useMemo(() => [...new Set(studies.map(study => study.evidenceClass))].sort(), [studies])
  const yearOptions = useMemo(() => [...new Set(studies.map(study => String(study.year || '')).filter(Boolean))].sort((a, b) => Number(b) - Number(a)), [studies])
  const gradeOptions = useMemo(() => [...new Set(studies.flatMap(study => study.relationships.map(item => item.evidenceGrade)))].sort(), [studies])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const minN = minSample ? Number(minSample) : 0
    const durationNeedle = duration.trim().toLowerCase()

    return studies.filter(study => {
      if (ingredient && !study.relationships.some(item => item.ingredientSlug === ingredient)) return false
      if (condition && !study.conditions.includes(condition)) return false
      if (studyClass && study.evidenceClass !== studyClass) return false
      if (year && String(study.year || '') !== year) return false
      if (grade && !study.relationships.some(item => item.evidenceGrade === grade)) return false
      if (relationship && !study.relationships.some(item => item.relationship === relationship)) return false
      if (minN && (parseSampleSize(study.sampleSize) || 0) < minN) return false
      if (durationNeedle && !String(study.duration || '').toLowerCase().includes(durationNeedle)) return false
      if (safety === 'reported' && !study.safetyOutcome) return false
      if (safety === 'not-reported' && study.safetyOutcome) return false
      if (needle) {
        const haystack = [
          study.title,
          study.authors,
          study.journal,
          study.population,
          study.outcome,
          study.result,
          study.extractName,
          study.conditions.join(' '),
          study.relationships.map(item => `${item.ingredientName} ${item.ingredientSlug}`).join(' '),
        ].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })
  }, [studies, query, ingredient, condition, studyClass, year, grade, minSample, duration, safety, relationship])

  const selectedIngredientName = ingredientOptions.find(([slug]) => slug === ingredient)?.[1]
  const timeline = useMemo(() => {
    if (!ingredient) return []
    return studies
      .filter(study => study.relationships.some(item => item.ingredientSlug === ingredient) && study.year)
      .sort((a, b) => Number(a.year) - Number(b.year))
  }, [studies, ingredient])

  const disagreementCount = filtered.filter(study => study.relationshipSummary === 'mixed').length
  const visible = filtered.slice(0, visibleCount)
  const hasFilters = Boolean(query || ingredient || condition || studyClass || year || grade || minSample || duration || safety || relationship)

  function changeFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setVisibleCount(PAGE_SIZE)
  }

  function resetFilters() {
    setQuery(''); setIngredient(''); setCondition(''); setStudyClass(''); setYear(''); setGrade('')
    setMinSample(''); setDuration(''); setSafety(''); setRelationship(''); setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-brand-900/10 bg-white p-5 shadow-sm sm:p-6" aria-label="Study filters">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="xl:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Search studies</span>
            <input value={query} onChange={event => changeFilter(setQuery, event.target.value)} placeholder="Title, ingredient, outcome, population…" className="mt-1.5 w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-700" />
          </label>
          <label><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Ingredient</span><select value={ingredient} onChange={event => changeFilter(setIngredient, event.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm text-ink"><option value="">All ingredients</option>{ingredientOptions.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}</select></label>
          <label><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Condition</span><select value={condition} onChange={event => changeFilter(setCondition, event.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm text-ink"><option value="">All conditions</option>{conditionOptions.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Study type</span><select value={studyClass} onChange={event => changeFilter(setStudyClass, event.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm text-ink"><option value="">All study classes</option>{classOptions.map(item => <option key={item} value={item}>{formatEvidenceStudyClass(item as EvidenceStudyClass)}</option>)}</select></label>
          <label><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Publication year</span><select value={year} onChange={event => changeFilter(setYear, event.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm text-ink"><option value="">All years</option>{yearOptions.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Evidence grade</span><select value={grade} onChange={event => changeFilter(setGrade, event.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm text-ink"><option value="">All grades</option>{gradeOptions.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Minimum sample size</span><input value={minSample} onChange={event => changeFilter(setMinSample, event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="e.g. 100" className="mt-1.5 w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm text-ink" /></label>
          <label><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Duration contains</span><input value={duration} onChange={event => changeFilter(setDuration, event.target.value)} placeholder="e.g. 8 weeks" className="mt-1.5 w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm text-ink" /></label>
          <label><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Safety outcome</span><select value={safety} onChange={event => changeFilter(setSafety, event.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm text-ink"><option value="">Any safety reporting</option><option value="reported">Safety outcome recorded</option><option value="not-reported">No structured safety outcome</option></select></label>
          <label><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Evidence direction</span><select value={relationship} onChange={event => changeFilter(setRelationship, event.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm text-ink"><option value="">All directions</option><option value="supports">Supporting</option><option value="mixed">Mixed</option><option value="contradicts">Contradicting</option><option value="no_clear_effect">No clear effect</option><option value="background">Background</option></select></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-900/10 pt-4">
          <p className="text-sm text-muted"><strong className="text-ink">{filtered.length.toLocaleString()}</strong> studies match{disagreementCount ? <> · <strong className="text-amber-800">{disagreementCount}</strong> mixed/discordant</> : null}</p>
          {hasFilters ? <button type="button" onClick={resetFilters} className="rounded-full border border-brand-900/15 px-4 py-2 text-xs font-bold text-ink hover:bg-brand-50">Clear filters</button> : null}
        </div>
      </section>

      {ingredient && timeline.length > 0 ? (
        <section className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-5 sm:p-6">
          <p className="eyebrow-label">Research timeline</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{selectedIngredientName}: structured publication timeline</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {timeline.map(study => <a key={study.id} href={`#${anchorId(study.id)}`} className="min-w-[190px] rounded-xl border border-brand-900/10 bg-white p-3 text-xs hover:border-brand-700/30"><strong className="block text-brand-800">{study.year}</strong><span className="mt-1 line-clamp-3 block leading-5 text-muted">{study.title}</span></a>)}
          </div>
        </section>
      ) : null}

      {disagreementCount > 0 ? <section className="rounded-2xl border border-amber-700/20 bg-amber-50 p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-900">Where studies disagree</p><p className="mt-2 text-sm leading-6 text-amber-950">This result set contains study entities linked to mixed, unfavorable, or null interpretations across ingredient or outcome contexts. Those relationships remain visible instead of being averaged into one smooth score.</p></section> : null}

      <section className="space-y-4" aria-live="polite">
        {visible.length === 0 ? <div className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-6 text-sm text-muted">No structured studies match these filters.</div> : visible.map(study => {
          const url = sourceUrl(study)
          return (
            <article key={study.id} id={anchorId(study.id)} className="scroll-mt-24 rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2"><span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-800">{formatEvidenceStudyClass(study.evidenceClass)}</span><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${relationTone(study.relationshipSummary)}`}>{evidenceRelationshipLabel(study.relationshipSummary)}</span>{study.year ? <span className="rounded-full border border-brand-900/10 px-2.5 py-1 text-[10px] font-semibold text-muted">{study.year}</span> : null}{study.sampleSize ? <span className="rounded-full border border-brand-900/10 px-2.5 py-1 text-[10px] font-semibold text-muted">n={study.sampleSize}</span> : null}</div>
                  <h2 className="mt-3 text-lg font-semibold leading-snug text-ink">{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-700 hover:underline">{study.title}</a> : study.title}</h2>
                  {(study.authors || study.journal) ? <p className="mt-1 text-xs leading-5 text-muted">{[study.authors, study.journal].filter(Boolean).join(' · ')}</p> : null}
                </div>
                <a href={`#${anchorId(study.id)}`} className="text-xs font-semibold text-brand-700 hover:underline" aria-label={`Permanent anchor for ${study.title}`}>#{study.id}</a>
              </div>
              <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                {study.population ? <div><dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Population</dt><dd className="mt-1 leading-6 text-ink">{study.population}</dd></div> : null}
                {study.dose ? <div><dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Dose / form</dt><dd className="mt-1 leading-6 text-ink">{study.dose}{study.extractName ? ` · ${study.extractName}` : ''}</dd></div> : null}
                {study.duration ? <div><dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Duration</dt><dd className="mt-1 leading-6 text-ink">{study.duration}</dd></div> : null}
                {study.outcome ? <div><dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Outcome</dt><dd className="mt-1 leading-6 text-ink">{study.outcome}</dd></div> : null}
              </dl>
              {study.result ? <p className="mt-4 rounded-xl bg-brand-50/60 p-4 text-sm leading-7 text-ink"><strong>Result:</strong> {study.result}</p> : null}
              {study.limitation ? <p className="mt-3 text-sm leading-7 text-muted"><strong className="text-ink">Limitation:</strong> {study.limitation}</p> : null}
              {study.safetyOutcome ? <p className="mt-3 text-sm leading-7 text-muted"><strong className="text-ink">Safety outcome:</strong> {study.safetyOutcome}</p> : null}
              <div className="mt-5 border-t border-brand-900/10 pt-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Ingredient / claim relationships</p><div className="mt-2 flex flex-wrap gap-2">{study.relationships.map((item, index) => <Link key={`${item.ingredientSlug}-${item.relationship}-${index}`} href={item.ingredientPath} className={`rounded-full border px-3 py-1.5 text-xs font-semibold hover:brightness-95 ${relationTone(item.relationship)}`}>{item.ingredientName} · {item.evidenceGrade} · {evidenceRelationshipLabel(item.relationship)}</Link>)}</div></div>
            </article>
          )
        })}
      </section>

      {visibleCount < filtered.length ? <div className="flex justify-center"><button type="button" onClick={() => setVisibleCount(count => count + PAGE_SIZE)} className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900">Show {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more studies</button></div> : null}
    </div>
  )
}
