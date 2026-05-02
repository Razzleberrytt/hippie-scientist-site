import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompoundBySlug,getCompounds } from '@/lib/runtime-data'
import stacksData from '@/public/data/stacks.json'
import { getCompoundSearchLinks } from '@/lib/affiliate'

const stacks = stacksData as any[]

const comparisons=[
  'creatine-vs-beta-alanine',
  'magnesium-vs-glycine',
  'caffeine-vs-l-theanine',
  'cdp-choline-vs-alpha-gpc'
]

export async function generateStaticParams(){const c=await getCompounds();return c.map((x:any)=>({slug:x.slug}))}

export default async function Page({params}:any){
  const {slug}=await params
  const compound=await getCompoundBySlug(slug)
  if(!compound)notFound()

  const label=compound.displayName||compound.name||slug
  const links=getCompoundSearchLinks(label)

  const compareLinks=comparisons.filter(c=>c.includes(slug))

  const relatedStacks = stacks.filter(stack =>
    stack.stack?.some((item:any)=>item.compound===slug)
  )

  return(
    <div className='space-y-6'>
      <h1 className='text-4xl font-black text-white'>{label}</h1>

      {compareLinks.length>0 && (
        <section>
          <h2 className='text-xl font-bold text-white'>Compare With</h2>
          <div className='mt-2 flex flex-wrap gap-2'>
            {compareLinks.map(c=> (
              <Link key={c} href={`/compare/${c}`} className='text-sm text-white/70 hover:text-white'>
                {c.replace('-vs-',' vs ')}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedStacks.length>0 && (
        <section>
          <h2 className='text-xl font-bold text-white'>Used in stacks</h2>
          <div className='mt-2 flex flex-wrap gap-2'>
            {relatedStacks.map(s=> (
              <Link key={s.slug} href={`/stacks/${s.slug}`} className='text-sm text-emerald-300 hover:text-emerald-100'>
                {s.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedStacks.length===0 && (
        <section>
          <h2 className='text-xl font-bold text-white'>Explore stacks</h2>
          <Link href='/stacks' className='text-sm text-emerald-300'>Explore stacks using this compound</Link>
        </section>
      )}

      <section>
        {links.map(l=> (
          <a key={l.label} href={l.url} target='_blank' rel='noopener noreferrer'>{l.label}</a>
        ))}
      </section>

      <section className='rounded-3xl border border-white/10 p-5'>
        <h2 className='text-xl font-bold text-white'>Explore More</h2>
        <div className='mt-3 flex flex-wrap gap-3'>
          <Link href='/stacks' className='text-sm text-white/70 hover:text-white'>Browse stacks</Link>
          <Link href='/herbs' className='text-sm text-white/70 hover:text-white'>Browse herbs</Link>
        </div>
      </section>
    </div>
  )
}
