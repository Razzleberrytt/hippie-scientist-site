'use client'

import { ExternalLink, Award, CheckCircle2, ShieldCheck } from 'lucide-react'
import type { ResolvedProductRoute } from '@/lib/affiliate-intelligence-routing'

interface AffiliateProductCardProps {
  route: ResolvedProductRoute
  isBestCost?: boolean
  isBestPotency?: boolean
  isBestCert?: boolean
}

export default function AffiliateProductCard({
  route,
  isBestCost,
  isBestPotency,
  isBestCert,
}: AffiliateProductCardProps) {
  const { product, targetDoseMg, capsulesNeeded, actualYieldMg, activeYieldMg, costPerDoseUsd, affiliateUrl } = route

  const primaryIng = product.activeIngredients[0]

  return (
    <div
      className='group relative flex flex-col justify-between rounded-3xl border border-brand-900/10 bg-white p-5 hover:shadow-md transition-all duration-300'
    >
      {/* Badges Container */}
      <div className='absolute -top-3 left-4 flex gap-1.5'>
        {isBestCost && (
          <span className='rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/50 px-2.5 py-0.5 text-[10px] font-bold shadow-xs'>
            Best Value
          </span>
        )}
        {isBestPotency && (
          <span className='rounded-full bg-blue-100 text-blue-800 border border-blue-200/50 px-2.5 py-0.5 text-[10px] font-bold shadow-xs'>
            Highest Yield
          </span>
        )}
        {isBestCert && (
          <span className='rounded-full bg-purple-100 text-purple-800 border border-purple-200/50 px-2.5 py-0.5 text-[10px] font-bold shadow-xs'>
            Premium Quality
          </span>
        )}
      </div>

      <div className='space-y-4 pt-1'>
        {/* Header */}
        <div>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
            {product.brand}
          </span>
          <h3 className='text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors leading-tight mt-0.5'>
            {product.name}
          </h3>
        </div>

        {/* Pricing Details */}
        <div className='flex items-baseline justify-between border-y border-slate-100 py-3'>
          <div>
            <span className='text-2xl font-black text-slate-800'>
              ${product.priceUsd.toFixed(2)}
            </span>
            <span className='text-[10px] text-slate-400 ml-1'>
              ({product.capsulesPerContainer} caps)
            </span>
          </div>
          <div className='text-right'>
            <span className='text-xs font-bold text-emerald-700 block'>
              ${costPerDoseUsd.toFixed(3)} / dose
            </span>
            <span className='text-[9px] text-slate-400'>
              At {targetDoseMg}mg target
            </span>
          </div>
        </div>

        {/* Dosage Optimization Info */}
        <div className='space-y-2 text-xs'>
          <div className='flex justify-between items-center text-slate-600 bg-slate-50/50 rounded-xl p-2.5 border border-slate-100'>
            <span className='font-medium'>Daily Serving:</span>
            <span className='font-bold text-slate-800'>
              {capsulesNeeded} {capsulesNeeded === 1 ? 'capsule' : 'capsules'} ({actualYieldMg}mg)
            </span>
          </div>

          {primaryIng && (
            <div className='flex justify-between items-center text-slate-600 px-1'>
              <span>Active standardization:</span>
              <span className='font-semibold text-slate-700 text-[11px]'>
                {primaryIng.activeYieldPercent}% {primaryIng.activeCompound}
              </span>
            </div>
          )}

          <div className='flex justify-between items-center text-slate-600 px-1'>
            <span>Active compound yield:</span>
            <span className='font-bold text-emerald-800 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md'>
              {activeYieldMg.toFixed(1)}mg {primaryIng?.activeCompound}
            </span>
          </div>
        </div>

        {/* Certifications Check */}
        <div className='space-y-1.5 pt-1'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block'>
            Quality Verification
          </span>
          <div className='flex flex-wrap gap-1.5'>
            {product.certifications.map(cert => (
              <span
                key={cert}
                className='inline-flex items-center gap-1 rounded-lg bg-emerald-50/50 border border-emerald-100/50 px-2 py-1 text-[10px] font-semibold text-emerald-800'
              >
                {cert === 'GMP' || cert === 'USP' || cert === 'NSF' ? (
                  <ShieldCheck className='h-3 w-3 text-emerald-600 shrink-0' />
                ) : (
                  <Award className='h-3 w-3 text-emerald-600 shrink-0' />
                )}
                {cert}
              </span>
            ))}
            {product.certifications.length === 0 && (
              <span className='text-[10px] text-slate-400 italic'>Standard product purity</span>
            )}
          </div>
        </div>
      </div>

      {/* Referral Action */}
      <div className='mt-5 pt-3 border-t border-slate-100 space-y-2.5'>
        <a
          href={affiliateUrl}
          target='_blank'
          rel='nofollow sponsored noopener noreferrer'
          className='flex w-full items-center justify-between rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer'
        >
          <span>Sourcing Options on Amazon</span>
          <ExternalLink className='h-3.5 w-3.5 shrink-0 ml-1' />
        </a>
        <div className='flex items-center justify-center gap-1 text-[9px] text-slate-400 leading-none'>
          <CheckCircle2 className='h-3 w-3 text-emerald-600 shrink-0' />
          <span>Affiliate Link · Earns commission</span>
        </div>
      </div>
    </div>
  )
}
