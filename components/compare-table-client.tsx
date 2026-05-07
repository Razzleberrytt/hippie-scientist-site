'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { EvidenceBadge } from '@/components/ui'
import { formatDisplayLabel, isClean, list as cleanList, text as cleanText } from '@/lib/display-utils'

type Compound = Record<string, any>
const text = (v: any) => {
 const value = cleanText(v)
 return isClean(value) ? formatDisplayLabel(value) : ''
}
const list = (v: any) => cleanList(v)
const getUseCaseLabel = (c: Compound) => {
 const h=`${text(c.role)} ${list(c.primary_effects||c.effects).join(' ')}`.toLowerCase()
 if (/strength|power|performance|muscle/.test(h)) return 'Strength'
 if (/stress|anxiety|calm|cortisol/.test(h)) return 'Stress'
 if (/sleep|insomnia|rest/.test(h)) return 'Sleep'
 if (/focus|cognition|memory|brain/.test(h)) return 'Focus'
 return text(c.role) || 'General wellness'
}
const summary=(v:any)=>{const i=list(v); return i.length?i.slice(0,2).join(' · '):'—'}

export function CompareTableClient({ compounds }: { compounds: Compound[] }) {
 const searchParams=useSearchParams()
 const selected=useMemo(()=>{const slugs=(searchParams.get('c')||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean).slice(0,3);return compounds.filter(c=>slugs.includes(String(c.slug||'').toLowerCase()))},[compounds,searchParams])
 if (selected.length<2) return <p className="text-neutral-600">Select at least 2 compounds to compare</p>
 const rows:[string,(c:Compound)=>any][]=[['Best for',c=>summary(c.primary_effects||c.effects)],['Evidence',c=><EvidenceBadge value={text(c.evidence_tier||c.evidenceTier||c.evidence_grade)||'Limited'} />],['Time to effect',c=>text(c.time_to_effect)||'—'],['Use case',c=>getUseCaseLabel(c)||'—'],['Safety',c=>summary(c.safety_flags||c.safetyNotes||c.contraindications)],['Complexity',c=>text(c.complexity)||'Low'],['Cost',c=>text(c.cost)||'Low']]
 return <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white"><table className="min-w-[720px] w-full text-left text-sm"><thead><tr className="border-b border-neutral-100"><th className="p-4 font-semibold text-neutral-600">Metric</th>{selected.map(c=><th key={c.slug} className="p-4 font-semibold"><Link href={`/compounds/${c.slug}`} className="text-teal-700 underline underline-offset-2">{c.name||c.slug}</Link></th>)}</tr></thead><tbody>{rows.map(([label,render])=><tr key={label} className="border-b border-neutral-100 align-top last:border-0"><th className="p-4 font-medium text-neutral-600">{label}</th>{selected.map(c=><td key={`${c.slug}-${label}`} className="p-4 text-neutral-800">{render(c)}</td>)}</tr>)}</tbody></table></div>
}
