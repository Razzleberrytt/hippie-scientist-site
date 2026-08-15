import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LEAD_MAGNETS, getLeadMagnet } from '@/lib/lead-magnets'
import { buildPageMetadata } from '@/lib/seo'

interface PageProps { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return Object.values(LEAD_MAGNETS).map((offer) => ({ slug: offer.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const offer = getLeadMagnet(slug)
  if (!offer) return {}
  return buildPageMetadata({
    title: offer.title,
    description: offer.description,
    path: `/lead-magnets/${offer.slug}`,
  })
}

export default async function LeadMagnetResourcePage({ params }: PageProps) {
  const { slug } = await params
  const offer = getLeadMagnet(slug)
  if (!offer) notFound()

  return (
    <main className='mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-10'>
      <nav aria-label='Breadcrumb' className='text-sm text-muted'>
        <Link href='/' className='font-semibold text-indigo-800 hover:underline'>Home</Link>
        <span aria-hidden='true' className='mx-2'>/</span>
        <Link href='/lead-magnets/' className='font-semibold text-indigo-800 hover:underline'>Free resources</Link>
      </nav>

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>{offer.eyebrow}</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>{offer.title}</h1>
        <p className='mt-4 max-w-4xl text-base leading-7 text-muted sm:text-lg'>{offer.description}</p>
        <ul className='mt-5 grid gap-2 sm:grid-cols-3'>
          {offer.bullets.map((bullet) => <li key={bullet} className='rounded-xl border border-brand-900/10 bg-brand-50/60 p-3 text-sm font-semibold leading-5 text-ink'>{bullet}</li>)}
        </ul>
        {offer.downloadHref ? (
          <a href={offer.downloadHref} className='mt-6 inline-flex rounded-full bg-indigo-950 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-900'>
            {offer.downloadLabel || 'Download resource'} ↓
          </a>
        ) : null}
      </section>

      <section className='grid gap-5'>
        {offer.sections.map((section, index) => (
          <article key={section.title} className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm sm:p-6'>
            <div className='flex gap-4'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-sm font-bold text-white'>{index + 1}</span>
              <div>
                <h2 className='text-xl font-bold text-ink'>{section.title}</h2>
                <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
                  {section.items.map((item) => <li key={item} className='flex gap-2'><span aria-hidden='true' className='mt-0.5 text-emerald-700'>✓</span><span>{item}</span></li>)}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className='rounded-2xl border border-sky-900/15 bg-sky-50/60 p-5 text-sm leading-6 text-sky-950'>
        <strong>Use this as a research framework, not a treatment plan.</strong> The resource helps organize evidence, product-quality, and safety questions. It does not determine whether a supplement is appropriate for a specific person.
      </section>

      <section className='flex flex-wrap gap-3 text-sm font-semibold'>
        <Link href='/evidence/' className='text-indigo-800 hover:underline'>Explore the evidence database →</Link>
        <Link href='/safety-checker/' className='text-indigo-800 hover:underline'>Open the Safety Checker →</Link>
        <Link href='/learn/product-quality/' className='text-indigo-800 hover:underline'>Review product-quality criteria →</Link>
      </section>
    </main>
  )
}
