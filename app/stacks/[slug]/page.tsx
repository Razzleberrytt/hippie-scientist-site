import { notFound } from 'next/navigation'
import stacks from '@/public/data/stacks.json'
import StackCard from '@/components/StackCard'
import AffiliateBlock from '@/components/AffiliateBlock'
import affiliateData from '@/public/data/affiliate-products.json'

export async function generateStaticParams() {
  return stacks.map((s: any) => ({ slug: s.slug }))
}

export default function StackPage({ params }: { params: { slug: string } }) {
  const stack = stacks.find((s: any) => s.slug === params.slug)

  if (!stack) return notFound()

  const topProducts = stack.stack
    .map((item: any) => affiliateData.find((d: any) => d.compound === item.compound))
    .filter(Boolean)
    .flatMap((entry: any) => entry.products)
    .slice(0, 3)

  return (
    <div className='space-y-6'>
      <h1 className='text-4xl font-black text-white'>{stack.title}</h1>
      <p className='text-white/70'>{stack.short_description}</p>

      <div className='grid gap-4'>
        {stack.stack.map((item: any, i: number) => (
          <div key={i} className='space-y-2'>
            <StackCard item={item} />
            <AffiliateBlock compound={item.compound} />
          </div>
        ))}
      </div>

      <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
        <h3 className='font-bold text-white'>How to use</h3>
        <p className='text-white/70 mt-1'>Follow listed dosages consistently. Combine timing as shown and evaluate response over 2–4 weeks.</p>
      </div>

      <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
        <h3 className='font-bold text-white'>Who it’s for</h3>
        <p className='text-white/70 mt-1'>{stack.who_for}</p>
      </div>

      <div className='rounded-2xl border border-white/10 bg-red-500/10 p-4'>
        <h3 className='font-bold text-white'>Who should avoid</h3>
        <p className='text-white/70 mt-1'>{stack.avoid_if}</p>
      </div>

      <div className='space-y-4'>
        <h2 className='text-2xl font-bold text-white'>Recommended Products</h2>
        <div className='grid gap-4'>
          {topProducts.map((p: any, i: number) => (
            <a
              key={i}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className='block rounded-2xl bg-emerald-300 py-3 text-center font-bold text-black'
            >
              {p.name}
            </a>
          ))}
        </div>
      </div>

      <button className='w-full rounded-2xl bg-emerald-300 py-3 font-bold text-black'>
        View Best Products
      </button>
    </div>
  )
}
