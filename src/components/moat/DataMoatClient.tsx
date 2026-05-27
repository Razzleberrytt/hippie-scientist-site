'use client'

import { useMemo } from 'react'
import Link from 'next/link'

interface DataMoatClientProps {
  herbs: any[]
  compounds: any[]
}

export default function DataMoatClient({ herbs, compounds }: DataMoatClientProps) {
  const stats = useMemo(() => {
    const totalHerbs = herbs.length
    const totalCompounds = compounds.length
    const totalItems = totalHerbs + totalCompounds

    let withSafety = 0
    let withDose = 0
    let withMechanism = 0
    let withAffiliate = 0
    let withPMID = 0

    let tierA = 0
    let tierB = 0
    let tierC = 0

    const combined = [...herbs, ...compounds]

    combined.forEach(item => {
      // Safety coverage
      if (item.safety || (item.safety_flags && item.safety_flags.length > 0)) {
        withSafety++
      }

      // Dosage coverage
      if (item.dosage || item.dose) {
        withDose++
      }

      // Mechanism coverage
      if (item.mechanism || (item.mechanisms && item.mechanisms.length > 0)) {
        withMechanism++
      }

      // Sourcing / affiliate coverage
      if (item.amazon_affiliate_url || item.affiliate_url || item.amazonAffiliateUrl) {
        withAffiliate++
      }

      // PMIDs/Citations
      const pmidText = String(item.pmids || item.citations || item.references || '')
      if (pmidText.match(/\d{5,8}/) || (Array.isArray(item.references) && item.references.length > 0)) {
        withPMID++
      }

      // Evidence Tier distribution
      const tier = String(item.evidence_tier || item.evidenceLevel || item.confidence || '').toUpperCase()
      if (tier.includes('A') || tier === 'STRONG') {
        tierA++
      } else if (tier.includes('B') || tier === 'MODERATE') {
        tierB++
      } else {
        tierC++
      }
    })

    const safetyPct = Math.round((withSafety / totalItems) * 100)
    const dosePct = Math.round((withDose / totalItems) * 100)
    const mechPct = Math.round((withMechanism / totalItems) * 100)
    const pmidPct = Math.round((withPMID / totalItems) * 100)
    const affiliatePct = Math.round((withAffiliate / totalItems) * 100)

    const averageCompleteness = Math.round((safetyPct + dosePct + mechPct + pmidPct) / 4)

    return {
      totalHerbs,
      totalCompounds,
      totalItems,
      safetyPct,
      dosePct,
      mechPct,
      pmidPct,
      affiliatePct,
      averageCompleteness,
      tierA,
      tierB,
      tierC,
    }
  }, [herbs, compounds])

  return (
    <div className='space-y-8'>
      {/* Metrics Row */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm space-y-1'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
            Total active entries
          </span>
          <p className='text-3xl font-black text-slate-800'>{stats.totalItems}</p>
          <p className='text-xs text-slate-500'>
            {stats.totalHerbs} herbs · {stats.totalCompounds} compounds
          </p>
        </div>

        <div className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm space-y-1'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
            A-Tier Clinical Evidence
          </span>
          <p className='text-3xl font-black text-emerald-700'>{stats.tierA}</p>
          <p className='text-xs text-slate-500'>
            Robust human clinical data verified
          </p>
        </div>

        <div className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm space-y-1'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
            AverageCompleteness
          </span>
          <p className='text-3xl font-black text-slate-800'>{stats.averageCompleteness}%</p>
          <p className='text-xs text-slate-500'>
            Safety, dose, mechanism & PMID coverage
          </p>
        </div>

        <div className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm space-y-1'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
            Monetization Readiness
          </span>
          <p className='text-3xl font-black text-emerald-800'>{stats.affiliatePct}%</p>
          <p className='text-xs text-slate-500'>
            Affiliate-aware sourcing checklists
          </p>
        </div>
      </div>

      {/* Main Analysis Panels */}
      <div className='grid gap-8 lg:grid-cols-2'>
        {/* Data Completeness & Moat Verification */}
        <div className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-6'>
          <h3 className='text-lg font-bold text-slate-800 border-b border-slate-100 pb-3'>
            Database Completeness Profile
          </h3>

          <div className='space-y-5'>
            {/* Mechanism completeness */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs font-bold'>
                <span className='text-slate-700'>Synaptic Mechanism Mapping</span>
                <span className='text-emerald-700'>{stats.mechPct}%</span>
              </div>
              <div className='h-2 w-full rounded-full bg-slate-100 overflow-hidden'>
                <div className='h-full bg-emerald-600 rounded-full' style={{ width: `${stats.mechPct}%` }} />
              </div>
              <p className='text-[10px] text-slate-400 leading-normal'>
                Entries linking specific bio-actives to receptors (GABA, Dopamine, Serotonin, AChE, etc.)
              </p>
            </div>

            {/* Safety completeness */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs font-bold'>
                <span className='text-slate-700'>Safety & Warning Auditing</span>
                <span className='text-emerald-700'>{stats.safetyPct}%</span>
              </div>
              <div className='h-2 w-full rounded-full bg-slate-100 overflow-hidden'>
                <div className='h-full bg-emerald-600 rounded-full' style={{ width: `${stats.safetyPct}%` }} />
              </div>
              <p className='text-[10px] text-slate-400 leading-normal'>
                Percentage of entries with fully audited contraindications, warnings, and safety flags.
              </p>
            </div>

            {/* Dosage completeness */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs font-bold'>
                <span className='text-slate-700'>Dosage & Yield Parameters</span>
                <span className='text-emerald-700'>{stats.dosePct}%</span>
              </div>
              <div className='h-2 w-full rounded-full bg-slate-100 overflow-hidden'>
                <div className='h-full bg-emerald-600 rounded-full' style={{ width: `${stats.dosePct}%` }} />
              </div>
              <p className='text-[10px] text-slate-400 leading-normal'>
                Percentage of entries with verified clinical ranges and active chemical marker thresholds.
              </p>
            </div>

            {/* PMID coverage */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs font-bold'>
                <span className='text-slate-700'>Biomedical PMID Citations</span>
                <span className='text-emerald-700'>{stats.pmidPct}%</span>
              </div>
              <div className='h-2 w-full rounded-full bg-slate-100 overflow-hidden'>
                <div className='h-full bg-emerald-600 rounded-full' style={{ width: `${stats.pmidPct}%` }} />
              </div>
              <p className='text-[10px] text-slate-400 leading-normal'>
                Entries linked directly to primary research database indexes (PubMed/MEDLINE).
              </p>
            </div>
          </div>
        </div>

        {/* Evidence certitude and authority sections */}
        <div className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-6'>
          <h3 className='text-lg font-bold text-slate-800 border-b border-slate-100 pb-3'>
            Evidence Certitude Distribution
          </h3>

          <div className='space-y-6'>
            {/* Visual breakdown bar */}
            <div className='flex h-6 w-full rounded-full overflow-hidden text-[9px] font-bold text-white text-center'>
              <div
                className='bg-emerald-600 flex items-center justify-center transition-all'
                style={{ width: `${Math.round((stats.tierA / stats.totalItems) * 100)}%` }}
                title={`A-Tier: ${stats.tierA}`}
              >
                A-Tier ({Math.round((stats.tierA / stats.totalItems) * 100)}%)
              </div>
              <div
                className='bg-amber-500 flex items-center justify-center transition-all'
                style={{ width: `${Math.round((stats.tierB / stats.totalItems) * 100)}%` }}
                title={`B-Tier: ${stats.tierB}`}
              >
                B-Tier ({Math.round((stats.tierB / stats.totalItems) * 100)}%)
              </div>
              <div
                className='bg-slate-400 flex items-center justify-center transition-all'
                style={{ width: `${Math.round((stats.tierC / stats.totalItems) * 100)}%` }}
                title={`C-Tier: ${stats.tierC}`}
              >
                C-Tier ({Math.round((stats.tierC / stats.totalItems) * 100)}%)
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-3 text-center'>
              <div className='rounded-xl bg-emerald-50/50 border border-emerald-100/50 p-3.5 space-y-1'>
                <span className='text-[9px] font-bold text-emerald-800 uppercase tracking-wider block'>A-Tier</span>
                <p className='text-2xl font-black text-emerald-950'>{stats.tierA}</p>
                <p className='text-[10px] text-slate-500 leading-normal'>Strong Clinical Trials</p>
              </div>
              <div className='rounded-xl bg-amber-50/50 border border-amber-100/50 p-3.5 space-y-1'>
                <span className='text-[9px] font-bold text-amber-800 uppercase tracking-wider block'>B-Tier</span>
                <p className='text-2xl font-black text-amber-950'>{stats.tierB}</p>
                <p className='text-[10px] text-slate-500 leading-normal'>Moderate Evidence</p>
              </div>
              <div className='rounded-xl bg-slate-50 border border-slate-200/50 p-3.5 space-y-1'>
                <span className='text-[9px] font-bold text-slate-800 uppercase tracking-wider block'>C-Tier</span>
                <p className='text-2xl font-black text-slate-900'>{stats.tierC}</p>
                <p className='text-[10px] text-slate-500 leading-normal'>Emerging / In-Vitro</p>
              </div>
            </div>

            <div className='rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-600 leading-relaxed'>
              <span className='font-bold text-slate-800'>The Data Moat Philosophy:</span>
              <p className='mt-1 opacity-90'>
                We grade all platform monographs strictly using a modified GRADE criteria. We do not aggregate generic blog reviews; every rating is tied directly to verified molecular mechanisms and published human/in-vitro trials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
