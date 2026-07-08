import { buildPageMetadata } from '../../../src/lib/seo'
import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '../../../src/lib/runtime-data'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import DosageCalculatorClient from '../../../src/components/dosing/DosageCalculatorClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { isRestrictedRecord } from '../../../src/lib/restricted-ingredients'
import { toDosingToolRecord } from '../../../src/lib/tool-page-payloads'
import type { RuntimeRecord } from '../../../src/types/content'

export const metadata: Metadata = buildPageMetadata({
  title: 'Dynamic Dosage & Active Molecular Yield Calculator',
  description: 'Compute conservative educational supplement dosing ranges based on body weight and extract concentration. Calculate active chemical yields and cycle notes.',
  path: '/info/dosing/',
})

export default async function DosingPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs: RuntimeRecord[] = rawHerbs.filter((h: RuntimeRecord) => {
    if (isRestrictedRecord(h)) return false
    try {
      return getRuntimeVisibility(h).canRender
    } catch {
      return true
    }
  })

  const compounds: RuntimeRecord[] = rawCompounds.filter((c: RuntimeRecord) => {
    if (isRestrictedRecord(c)) return false
    try {
      return getRuntimeVisibility(c).canRender
    } catch {
      return true
    }
  })

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Dynamic Dosage & Active Molecular Yield Calculator"
        description="Calculate personalized dosing ranges and active marker compounds for cognitive and physical supplements."
        url="https://thehippiescientist.net/info/dosing"
        type="MedicalWebPage"
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-4'>
        <p className='eyebrow-label'>Dosing Auditor</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Supplement Dosage Calculator
        </h1>
        <div className='rounded-2xl border border-rose-900/15 bg-rose-50 p-4 text-sm font-semibold leading-relaxed text-rose-950'>
          This tool is for educational purposes only. Consult a qualified healthcare provider before using any supplement, especially if you have medical conditions or take medications.
        </div>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Dosage requirements depend heavily on extract concentration, body weight, medical history, and concurrent medications. Use this educational tool to map published supplement ranges to conservative reference parameters.
        </p>
      </section>

      <section className='grid gap-4 md:grid-cols-3' aria-label='How to interpret supplement dose estimates'>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Separate label dose from active yield</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            A capsule can list 500 mg of extract while delivering a much smaller amount of the active marker compound. Standardization, extract ratio, and marker percentage matter more than the front-label milligram number when comparing products.
          </p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Treat ranges as starting context</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            Published ranges are not personal prescriptions. Individual sensitivity, medications, sleep debt, caffeine use, body size, liver metabolism, and health conditions can shift what feels too weak, useful, or too strong.
          </p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Avoid stacking unknowns</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            When testing a new supplement, changing multiple ingredients at once makes side effects harder to trace. A conservative approach changes one variable, starts low, tracks response, and avoids combining similar mechanisms too quickly.
          </p>
        </article>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
        <h2 className='text-xl font-bold tracking-tight text-ink'>Why supplement dose math gets confusing</h2>
        <div className='mt-4 space-y-4 text-sm leading-7 text-muted'>
          <p>
            Supplement labels often mix several measurement systems: raw herb weight, extract weight, extract ratio, standardized marker percentage, and serving size. Two products can look similar on the front label while delivering very different amounts of the compounds most likely to drive the effect.
          </p>
          <p>
            The safest use of this calculator is comparison, not escalation. It helps translate a product label into a conservative reference estimate so you can compare forms, spot unusually aggressive serving sizes, and decide whether a product deserves more safety review before use.
          </p>
        </div>
      </section>

      <DosageCalculatorClient
        herbs={herbs.map((herb) => toDosingToolRecord(herb, 'herb'))}
        compounds={compounds.map((compound) => toDosingToolRecord(compound, 'compound'))}
      />

      <section className='rounded-2xl border border-rose-900/15 bg-rose-50/50 p-5 text-xs leading-relaxed text-rose-950'>
        <p className='font-bold flex items-center gap-1.5'>
          ⚠️ Dosing Safety Warning:
        </p>
        <p className='mt-1.5'>
          Calculations are purely educational models based on published monograph ranges. Individual biochemistry can cause varying sensitivities. Always start at the lower bound (or below) to test for idiosyncratic hypersensitivity or allergen triggers before scaling up. Never exceed recommendations without consulting a physician.
        </p>
      </section>
    </div>
  )
}
