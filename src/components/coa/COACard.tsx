import Card from '@/components/ui/Card'
import COAVerificationBadge from '@/components/coa/COAVerificationBadge'
import type { COADocument, COATestResult } from '@/types/coa'

type COACardProps = {
  coa: COADocument
}

const testLabelByCategory: Record<COATestResult['category'], string> = {
  potency: 'Potency',
  heavy_metals: 'Heavy metals',
  microbes: 'Microbes',
}

function statusClasses(status: COATestResult['status']) {
  if (status === 'pass') return 'text-emerald-700 bg-emerald-100 border-emerald-200'
  if (status === 'fail') return 'text-rose-700 bg-rose-100 border-rose-200'
  return 'text-amber-700 bg-amber-100 border-amber-200'
}

function availabilityCopy(coa: COADocument) {
  if (coa.availability === 'no_coa') return 'No COA provided by the seller for this batch.'
  if (coa.availability === 'insufficient_data') return 'COA is available, but required fields are missing or unreadable.'
  if (coa.availability === 'unverified_lab') return 'Lab identity or accreditation could not be confirmed.'
  return null
}

export default function COACard({ coa }: COACardProps) {
  const availabilityMessage = availabilityCopy(coa)

  return (
    <Card className='rounded-2xl p-4 sm:p-5 space-y-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold text-ink'>{coa.labName || 'Lab not disclosed'}</h3>
          <p className='text-sm text-[#46574d] mt-1'>
            {coa.isIso17025Accredited ? 'ISO 17025 accredited' : 'ISO 17025 not confirmed'}
          </p>
        </div>
        <COAVerificationBadge confidence={coa.confidence} rationale={coa.confidenceRationale} />
      </div>

      <dl className='grid gap-2 sm:grid-cols-2 text-sm'>
        <div className='rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] p-2.5'>
          <dt className='text-xs uppercase tracking-wide text-[var(--text-muted)]'>Test date</dt>
          <dd className='mt-1 text-ink font-medium'>{coa.testDate || 'Not listed'}</dd>
        </div>
        <div className='rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] p-2.5'>
          <dt className='text-xs uppercase tracking-wide text-[var(--text-muted)]'>Batch / lot</dt>
          <dd className='mt-1 text-ink font-medium'>{coa.batchLot || 'Not listed'}</dd>
        </div>
      </dl>

      {availabilityMessage ? (
        <p className='rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900'>{availabilityMessage}</p>
      ) : (
        <ul className='space-y-2' aria-label='COA key results'>
          {coa.testResults.map((result) => (
            <li key={`${result.category}-${result.analyte}`} className='rounded-xl border border-[var(--border-default)] p-3'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <p className='text-sm font-medium text-ink'>
                  {testLabelByCategory[result.category]} · {result.analyte}
                </p>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${statusClasses(result.status)}`}>
                  {result.status.replace('_', ' ')}
                </span>
              </div>
              <p className='mt-1 text-xs text-[#46574d]'>
                Measured: {result.measuredValue || 'Not listed'} · Limit: {result.limit || 'Not listed'}
              </p>
            </li>
          ))}
        </ul>
      )}

      {coa.pdfUrl && (
        <a href={coa.pdfUrl} target='_blank' rel='noreferrer' className='text-sm font-semibold text-brand-800 hover:text-brand-700 underline'>
          Open full COA PDF
        </a>
      )}
    </Card>
  )
}
