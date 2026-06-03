'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AFFILIATE_TAGS } from '@/config/affiliate'
import { isRestrictedRecord } from '@/lib/restricted-ingredients'

interface GuideItem {
  slug: string
  name: string
  type: 'herb' | 'compound'
  criteria: string[]
  affiliateUrl: string
  affiliateLabel: string
  standardization?: string
  bestFor?: string
}

interface BuyGuideClientProps {
  herbs: any[]
  compounds: any[]
}

export default function BuyGuideClient({ herbs, compounds }: BuyGuideClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Map and combine datasets
  const allItems = useMemo(() => {
    const combined = [
      ...herbs.map(item => ({ ...item, type: 'herb' as const })),
      ...compounds.map(item => ({ ...item, type: 'compound' as const })),
    ].filter(item => !isRestrictedRecord(item))

    return combined.map(item => {
      // Resolve buying criteria
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

      // Default criteria if empty
      if (criteria.length === 0) {
        if (item.type === 'herb') {
          criteria = [
            'Third-party testing for heavy metals and solvent residues',
            'Standardized to active marker compounds (e.g. extracts over raw root powder)',
            'Certified organic or sustainably wildcrafted sourcing'
          ]
        } else {
          criteria = [
            'USP or pharmaceutical grade purity (98%+ minimum)',
            'Third-party tested COA (Certificate of Analysis) available',
            'Free from synthetic flow agents and common allergen fillers'
          ]
        }
      }

      // Resolve affiliate URL
      let affiliateUrl = ''
      const direct = item.amazon_affiliate_url || item.amazonAffiliateUrl
      if (direct && String(direct).includes('amazon.com/dp/')) {
        affiliateUrl = String(direct)
      } else {
        const prebuilt = item.affiliate_url || item.affiliateUrl
        if (prebuilt && String(prebuilt).includes('amazon.com') && String(prebuilt).includes('tag=')) {
          affiliateUrl = String(prebuilt)
        } else {
          const query = item.affiliate_query || item.affiliateQuery || item.displayName || item.name || item.slug
          const encoded = encodeURIComponent(`${query} supplement third party tested`)
          affiliateUrl = `https://www.amazon.com/s?k=${encoded}&tag=${AFFILIATE_TAGS.amazon}`
        }
      }

      const affiliateLabel = item.affiliate_label || item.affiliateLabel || `Find Verified ${item.displayName || item.name} on Amazon`
      const standardization = item.standardization || item.standardized_extract || item.active_compounds

      return {
        slug: item.slug,
        name: item.displayName || item.name || item.slug,
        type: item.type,
        criteria,
        affiliateUrl,
        affiliateLabel,
        standardization,
        bestFor: item.best_for || item.bestFor || item.primary_effects
      } as GuideItem
    })
  }, [herbs, compounds])

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return allItems
    return allItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.standardization && item.standardization.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, allItems])

  return (
    <div className='space-y-8'>
      {/* Sourcing Search bar */}
      <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
        <div className='max-w-xl space-y-2'>
          <h2 className='text-lg font-bold text-slate-800'>Search Sourcing Checklists</h2>
          <p className='text-xs text-slate-500'>
            Filter the guide to verify active standardized markers and quality controls before completing your purchase.
          </p>
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Search ingredient name (e.g. Ashwagandha, L-Theanine)...'
            className='w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none'
          />
        </div>
      </div>

      {/* Grid of Sourcing Cards */}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {filteredItems.length === 0 ? (
          <div className='col-span-full py-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-[2rem] bg-white/50'>
            No sourcing checklists match your search.
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.slug}
              className='flex flex-col justify-between rounded-3xl border border-brand-900/10 bg-white p-5 hover:shadow-md transition-shadow'
            >
              <div className='space-y-4'>
                {/* Header */}
                <div>
                  <div className='flex items-start justify-between gap-2'>
                    <Link
                      href={item.type === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
                      className='text-base font-bold text-slate-800 hover:text-emerald-700 hover:underline leading-snug'
                    >
                      {item.name}
                    </Link>
                    <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[9px] uppercase font-bold text-slate-500 shrink-0'>
                      {item.type}
                    </span>
                  </div>
                  {item.standardization && (
                    <p className='mt-1 text-[11px] text-emerald-800 font-semibold'>
                      Standardized to: {item.standardization}
                    </p>
                  )}
                </div>

                {/* Checklist */}
                <div className='border-t border-slate-100 pt-3 space-y-2.5'>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                    Quality Checklist
                  </span>
                  <ul className='space-y-2'>
                    {item.criteria.slice(0, 3).map((itemCriteria, idx) => (
                      <li key={idx} className='flex items-start gap-2 text-xs leading-relaxed text-slate-600'>
                        <svg
                          className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth={3}
                          stroke='currentColor'
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' d='M4.5 12.75l6 6 9-13.5' />
                        </svg>
                        <span>{itemCriteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action and Disclaimer */}
              <div className='mt-5 pt-3 border-t border-slate-100 space-y-3'>
                <a
                  href={item.affiliateUrl}
                  target='_blank'
                  rel='nofollow sponsored noopener noreferrer'
                  className='flex w-full items-center justify-between rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 transition-all shadow-sm'
                >
                  <span>Sourcing Options on Amazon</span>
                  <svg
                    className='h-3.5 w-3.5 shrink-0'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={2.5}
                    stroke='currentColor'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25' />
                  </svg>
                </a>
                <p className='text-[9px] text-center text-slate-400 leading-normal'>
                  Affiliate Link · Earns commission
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
