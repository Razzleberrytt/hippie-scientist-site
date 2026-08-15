'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AFFILIATE_TAGS } from '@/config/affiliate'
import { canRenderAffiliateLinks, ensureAmazonAffiliateTag } from '../../lib/affiliate'
import { trackRevenueEvent } from '../../lib/revenue-tracking'
import { scoreProductQuality, type ProductQualityScore } from '@/lib/product-quality-score'

interface GuideItem {
  slug: string
  name: string
  type: 'herb' | 'compound'
  criteria: string[]
  affiliateUrl: string
  affiliateLabel: string
  standardization?: string
  studiedForm?: string
  activeMarker?: string
  elementalAmount?: string
  activeDose?: string
  bestFor?: string
  quality: ProductQualityScore
}

interface BuyGuideClientProps {
  herbs: any[]
  compounds: any[]
}

const DEFAULT_VISIBLE_ITEMS = 12

const bandLabel: Record<ProductQualityScore['band'], string> = {
  'strong-label-quality': 'Strong label quality',
  'adequate-label-quality': 'Adequate label quality',
  'limited-quality-data': 'Limited quality data',
  'poor-transparency': 'Poor transparency',
}

export default function BuyGuideClient({ herbs, compounds }: BuyGuideClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const allItems = useMemo(() => {
    const combined = [
      ...herbs.map(item => ({ ...item, type: 'herb' as const })),
      ...compounds.map(item => ({ ...item, type: 'compound' as const })),
    ].filter(item => canRenderAffiliateLinks(item))

    return combined.map(item => {
      let criteria: string[] = []
      if (Array.isArray(item.buying_criteria)) {
        criteria = item.buying_criteria.filter((c: any) => typeof c === 'string' && c.trim())
      } else if (typeof item.buying_criteria === 'string' && item.buying_criteria.trim()) {
        criteria = item.buying_criteria.split(/[;,\n]+/).map((s: string) => s.trim()).filter(Boolean)
      } else if (item.buyingCriteria) {
        criteria = Array.isArray(item.buyingCriteria)
          ? item.buyingCriteria.filter(Boolean)
          : String(item.buyingCriteria).split(/[;,\n]+/).map((s: string) => s.trim()).filter(Boolean)
      }

      if (criteria.length === 0) {
        criteria = item.type === 'herb'
          ? [
              'Look for third-party testing for heavy metals and solvent residues',
              'Prefer a standardized extract or clearly identified botanical form when relevant',
              'Confirm the active amount and serving size on the current label',
            ]
          : [
              'Look for third-party purity or identity testing',
              'Check whether a COA (Certificate of Analysis) is available',
              'Confirm the active amount and serving size on the current label',
            ]
      }

      let affiliateUrl = ''
      const direct = item.amazon_affiliate_url || item.amazonAffiliateUrl
      if (direct && String(direct).includes('amazon.com/dp/')) {
        affiliateUrl = ensureAmazonAffiliateTag(String(direct))
      } else {
        const prebuilt = item.affiliate_url || item.affiliateUrl
        if (prebuilt && String(prebuilt).includes('amazon.com')) {
          affiliateUrl = ensureAmazonAffiliateTag(String(prebuilt))
        } else {
          const query = item.affiliate_query || item.affiliateQuery || item.displayName || item.name || item.slug
          const encoded = encodeURIComponent(`${query} supplement third party tested`)
          affiliateUrl = `https://www.amazon.com/s?k=${encoded}&tag=${AFFILIATE_TAGS.amazon}`
        }
      }

      const affiliateLabel = item.affiliate_label || item.affiliateLabel || `Find ${item.displayName || item.name} sourcing options`
      const standardization = item.standardization || item.standardized_extract || item.active_compounds
      const studiedForm = item.studied_form || item.studiedForm
      const activeMarker = item.active_marker || item.activeMarker
      const elementalAmount = item.elemental_amount || item.elementalAmount
      const activeDose = item.active_dose || item.activeDose

      const quality = scoreProductQuality({
        transparentActiveDose: item.transparent_active_dose === true || Boolean(activeDose),
        studiedFormDisclosed: Boolean(studiedForm),
        standardizedExtractOrForm: Boolean(standardization),
        activeMarkerDeclared: Boolean(activeMarker),
        elementalAmountDeclared: elementalAmount ? true : undefined,
        thirdPartyTesting: item.third_party_testing === true,
        coaAvailable: item.coa_available === true,
        contaminantTesting: item.contaminant_testing === true,
        adulterationControls: item.adulteration_controls === true,
        proprietaryBlend: item.proprietary_blend === true,
        currentFormulationVerified: item.formulation_verified === true,
      })

      return {
        slug: item.slug,
        name: item.displayName || item.name || item.slug,
        type: item.type,
        criteria,
        affiliateUrl,
        affiliateLabel,
        standardization,
        studiedForm,
        activeMarker,
        elementalAmount,
        activeDose,
        bestFor: item.best_for || item.bestFor || item.primary_effects,
        quality,
      } as GuideItem
    })
  }, [herbs, compounds])

  const filteredItems = useMemo(() => {
    if (!searchQuery) return allItems.slice(0, DEFAULT_VISIBLE_ITEMS)
    const query = searchQuery.toLowerCase()
    return allItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.slug.toLowerCase().includes(query) ||
      Boolean(item.standardization && String(item.standardization).toLowerCase().includes(query))
    )
  }, [searchQuery, allItems])

  return (
    <div className='space-y-8'>
      <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
        <div className='max-w-3xl space-y-2'>
          <p className='eyebrow-label'>Product-quality layer</p>
          <h2 className='text-lg font-bold text-slate-800'>Search sourcing checklists</h2>
          <p className='text-xs leading-5 text-slate-500'>Quality scores reward only structured product/form/testing facts actually recorded in the dataset. Checklist advice is guidance, not proof. Scores do not change an ingredient’s evidence grade, and affiliate commission is not a scoring input.</p>
          <input type='text' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder='Search ingredient name (e.g. Ashwagandha, L-Theanine)...' className='w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none' />
        </div>
      </div>

      {!searchQuery && allItems.length > DEFAULT_VISIBLE_ITEMS ? <p className='text-xs text-slate-500'>Showing {DEFAULT_VISIBLE_ITEMS} common sourcing checklists. Search by ingredient name to inspect the full library.</p> : null}

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {filteredItems.length === 0 ? (
          <div className='col-span-full py-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-[2rem] bg-white/50'>No sourcing checklists match your search.</div>
        ) : filteredItems.map(item => (
          <div key={item.slug} className='flex flex-col justify-between rounded-3xl border border-brand-900/10 bg-white p-5 hover:shadow-md transition-shadow'>
            <div className='space-y-4'>
              <div>
                <div className='flex items-start justify-between gap-2'>
                  <Link href={item.type === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`} className='text-base font-bold text-slate-800 hover:text-emerald-700 hover:underline leading-snug'>{item.name}</Link>
                  <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[9px] uppercase font-bold text-slate-500 shrink-0'>{item.type}</span>
                </div>
                {item.standardization ? <p className='mt-1 text-[11px] text-emerald-800 font-semibold'>Standardization/form: {item.standardization}</p> : null}
                {item.studiedForm ? <p className='mt-1 text-[11px] text-slate-500'>Studied form recorded: {item.studiedForm}</p> : null}
                {item.activeMarker ? <p className='mt-1 text-[11px] text-slate-500'>Active marker: {item.activeMarker}</p> : null}
                {item.elementalAmount ? <p className='mt-1 text-[11px] text-slate-500'>Elemental amount: {item.elementalAmount}</p> : null}
                {item.activeDose ? <p className='mt-1 text-[11px] text-slate-500'>Active dose/serving: {item.activeDose}</p> : null}
              </div>

              <div className='rounded-xl border border-sky-900/10 bg-sky-50/70 p-3'>
                <div className='flex items-center justify-between gap-3'><span className='text-[10px] font-bold uppercase tracking-wider text-sky-900'>Product-quality data score</span><strong className='text-sm text-sky-950'>{item.quality.score}/100</strong></div>
                <p className='mt-1 text-xs font-semibold text-sky-950'>{bandLabel[item.quality.band]}</p>
                <p className='mt-1 text-[10px] leading-4 text-sky-900'>Measures recorded label/form/testing transparency only. It is not an efficacy score.</p>
              </div>

              <div className='border-t border-slate-100 pt-3 space-y-2.5'>
                <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>What to verify before buying</span>
                <ul className='space-y-2'>{item.criteria.slice(0, 4).map((criterion, idx) => <li key={`${criterion}-${idx}`} className='flex items-start gap-2 text-xs leading-relaxed text-slate-600'><span aria-hidden='true' className='mt-0.5 text-emerald-600'>✓</span><span>{criterion}</span></li>)}</ul>
                {item.quality.cautions.length ? <p className='text-[10px] leading-4 text-amber-800'>Unverified / missing structured data: {item.quality.cautions.slice(0, 3).join(' · ')}</p> : null}
              </div>
            </div>

            <div className='mt-5 pt-3 border-t border-slate-100 space-y-3'>
              <a href={item.affiliateUrl} target='_blank' rel='nofollow sponsored noopener noreferrer' onClick={() => trackRevenueEvent({ kind: 'affiliate_click', location: 'product-quality-buy-guide', label: item.name, target: item.affiliateUrl, productSlug: item.slug })} className='flex w-full items-center justify-between rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 transition-all shadow-sm'><span>Sourcing options on Amazon</span><span aria-hidden='true'>↗</span></a>
              <p className='text-[9px] text-center text-slate-400 leading-normal'>Affiliate link · Commission never affects evidence or product-quality scoring</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
