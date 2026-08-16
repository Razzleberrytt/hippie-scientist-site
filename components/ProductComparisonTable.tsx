import { evaluateProductLifecycle, type ProductLifecycleMetadata } from '@/lib/product-lifecycle'

export interface ReliableProductComparisonRow {
  key: string
  product: string
  form: string
  activeAmount: string
  testing: string
  priceContext?: string
  lifecycle: ProductLifecycleMetadata & { lastVerifiedAt: string }
}

export default function ProductComparisonTable({ rows }: { rows: ReliableProductComparisonRow[] }) {
  const reliableRows = rows.filter((row) => evaluateProductLifecycle(row.lifecycle).action === 'allow')
  if (reliableRows.length < 2) return null

  return (
    <section className='space-y-3' aria-labelledby='verified-product-comparison-heading'>
      <div>
        <p className='eyebrow-label'>Verified product comparison</p>
        <h2 id='verified-product-comparison-heading' className='mt-1 text-xl font-bold text-ink'>Compare maintained product data</h2>
        <p className='mt-2 text-sm leading-6 text-muted'>Rows appear only while their formulation metadata is inside the verification window and still matches the reviewed form. Price context is descriptive and never affects evidence or product-quality scoring.</p>
      </div>
      <div className='overflow-x-auto rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] shadow-sm dark:border-white/10'>
        <table className='min-w-[760px] w-full border-collapse text-left text-sm'>
          <thead className='bg-brand-50/80 text-xs uppercase tracking-wide text-muted dark:bg-[var(--surface-card-strong)]'>
            <tr>
              <th className='p-4'>Product</th>
              <th className='p-4'>Form</th>
              <th className='p-4'>Active amount</th>
              <th className='p-4'>Testing / verification</th>
              <th className='p-4'>Price context</th>
              <th className='p-4'>Verified</th>
            </tr>
          </thead>
          <tbody>
            {reliableRows.map((row) => (
              <tr key={row.key} className='border-t border-brand-900/10 align-top transition-colors hover:bg-brand-50/30 dark:border-white/10 dark:hover:bg-white/[0.03]'>
                <td className='p-4 font-bold text-ink'>{row.product}</td>
                <td className='p-4 text-muted'>{row.form}</td>
                <td className='p-4 text-muted'>{row.activeAmount}</td>
                <td className='p-4 text-muted'>{row.testing}</td>
                <td className='p-4 text-muted'>{row.priceContext || 'Not compared'}</td>
                <td className='p-4 text-muted'>{row.lifecycle.lastVerifiedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
