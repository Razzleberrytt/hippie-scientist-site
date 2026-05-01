import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompoundBySlug,getCompounds,getHerbCompoundMap,getHerbs } from '@/lib/runtime-data'
import { getCompoundSearchLinks } from '@/lib/affiliate'
import { commonSupplementFaqJsonLd } from '@/lib/seo'

const comparisons=['creatine-vs-beta-alanine','magnesium-vs-glycine','caffeine-vs-l-theanine','ashwagandha-vs-rhodiola','citicoline-vs-alpha-gpc']

export async function generateStaticParams(){const c=await getCompounds();return c.map((x:any)=>({slug:x.slug}))}

export async function generateMetadata({params}:any){const {slug}=await params;const c=await getCompoundBySlug(slug);return{title:c?.displayName||slug}}

export default async function Page({params}:any){
  const {slug}=await params
  const compound=await getCompoundBySlug(slug)
  if(!compound)notFound()

  const label=compound.displayName||compound.name||slug
  const links=getCompoundSearchLinks(label)

  const compareLinks=comparisons.filter(c=>c.includes(slug))

  return(
    <div className='space-y-6'>
      <h1 className='text-4xl font-black text-white'>{label}</h1>

      <section>
        <h2 className='text-xl font-bold text-white'>Compare With</h2>
        <div className='mt-2 flex flex-wrap gap-2'>
          {compareLinks.map(c=> (
            <Link key={c} href={`/compare/${c}`} className='text-sm text-white/70 hover:text-white'>{c.replace('-vs-',' vs ')}</Link>
          ))}
        </div>
      </section>

      <section>
        {links.map(l=> (
          <a key={l.label} href={l.url} target='_blank' rel='noopener noreferrer'>{l.label}</a>
        ))}
      </section>
    </div>
  )
}
