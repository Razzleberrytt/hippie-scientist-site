/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { buildPageMetadata } from '../../src/lib/seo'
import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '../../src/lib/runtime-data'
import type { RuntimeRecord } from '../../src/types/content'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import DosageCalculatorClient from '../../src/components/dosing/DosageCalculatorClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { isRestrictedRecord } from '../../src/lib/restricted-ingredients'

export const metadata: Metadata = buildPageMetadata({
  title: 'Dynamic Dosage & Active Molecular Yield Calculator',
  description: 'Compute conservative educational supplement dosing ranges based on body weight and extract concentration. Calculate active chemical yields and cycle notes.',
  path: '/dosing/',
})

type DosageClientItem = {
  slug: string
  name: string
  displayName: string
  dosage?: string
  dose?: string
  administration?: string
  time_of_day?: string
  cycling?: string
  cycling_notes?: string
}

function asText(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function firstText(...values: unknown[]) {
  return values.map(asText).find(Boolean) || ''
}

function canUseRecord(record: RuntimeRecord) {
  if (isRestrictedRecord(record)) return false
  try {
    return getRuntimeVisibility(record).canRender
  } catch {
    return true
  }
}

function toDosageClientItem(record: RuntimeRecord): DosageClientItem {
  const slug = firstText(record.slug)
  const name = firstText(record.displayName, record.name, slug)

  return {
    slug,
    name,
    displayName: name,
    dosage: firstText(record.dosage, record.dose),
    dose: firstText(record.dose, record.dosage),
    administration: firstText(record.administration, record.time_of_day),
    time_of_day: firstText(record.time_of_day, record.administration),
    cycling: firstText(record.cycling, record.cycling_notes),
    cycling_notes: firstText(record.cycling_notes, record.cycling),
  }
}

export default async function DosingPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs = rawHerbs
    .filter(canUseRecord)
    .map(toDosageClientItem)
    .filter(item => item.slug)

  const compounds = rawCompounds
    .filter(canUseRecord)
    .map(toDosageClientItem)
    .filter(item => item.slug)

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Dynamic Dosage & Active Molecular Yield Calculator"
        description="Calculate personalized dosing ranges and active marker compounds for cognitive and physical supplements."
        url="https://thehippiescientist.net/dosing/"
        type="MedicalWebPage"
      />
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-4'>
        <p className='eyebrow-label'>Dosing Auditor</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>Supplement Dosage Calculator</h1>
        <div className='rounded-2xl border border-rose-900/15 bg-rose-50 p-4 text-sm font-semibold leading-relaxed text-rose-950'>This tool is for educational purposes only. Consult a qualified healthcare provider before using any supplement, especially if you have medical conditions or take medications.</div>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>Dosage requirements depend heavily on extract concentration, body weight, medical history, and concurrent medications. Use this educational tool to map published supplement ranges to conservative reference parameters.</p>
      </section>
      <DosageCalculatorClient herbs={herbs} compounds={compounds} />
      <section className='rounded-2xl border border-rose-900/15 bg-rose-50/50 p-5 text-xs leading-relaxed text-rose-950'>
        <p className='font-bold flex items-center gap-1.5'>⚠️ Dosing Safety Warning:</p>
        <p className='mt-1.5'>Calculations are purely educational models based on published monograph ranges. Individual biochemistry can cause varying sensitivities. Always start at the lower bound (or below) to test for idiosyncratic hypersensitivity or allergen triggers before scaling up. Never exceed recommendations without consulting a physician.</p>
      </section>
    </div>
  )
}
