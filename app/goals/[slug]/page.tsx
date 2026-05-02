import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import stacksData from '@/public/data/stacks.json'
import { getCompounds } from '@/lib/runtime-data'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

const stacks = stacksData as any[]

const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '')

export function generateStaticParams(){
  return goalConfigs.map(g=>({slug:g.slug}))
}

export function generateMetadata({params}:{params:{slug:string}}):Metadata{
  const goal=goalConfigs.find(g=>g.slug===params.slug)
  if(!goal)return{title:'Goal Guide'}
  return{
    title:`${goal.title} | The Hippie Scientist`,
    description:goal.summary
  }
}

export default async function Page({params}:{params:{slug:string}}){
  const goal=goalConfigs.find(g=>g.slug===params.slug)
  if(!goal) return notFound()

  const compounds=await getCompounds()
  const map=new Map()
  for(const c of compounds as any[]){
    if(!c?.slug)continue
    map.set(c.slug,c)
    if(c.name)map.set(normalize(c.name),c)
  }

  const relatedStacks=stacks.filter(s=>
    goal.stackSlugs.includes(s.slug) || normalize(s.goal||'')===goal.slug
  )

  const goalCompounds=goal.compoundCandidates
    .map(c=>map.get(c)||map.get(normalize(c)))
    .filter(Boolean)

  const ranked=[...goalCompounds].sort((a:any,b:any)=>
    (b.fact_score_v2||0)-(a.fact_score_v2||0)
  )

  const best=ranked[0]
  const budget=ranked.find((c:any)=>['caffeine','creatine','magnesium'].includes(c.slug))||ranked[1]
  const studied=[...ranked].sort((a:any,b:any)=>(b.evidenceTier||0)-(a.evidenceTier||0))[0]

  const comparisons=supplementComparisons.filter(c=>goal.comparisonSlugs.includes(c.slug))

  return(
    <main className="space-y-10">
      <section>
        <h1 className="text-4xl font-black text-white">{goal.title}</h1>
        <p className="text-white/80">{goal.summary}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {best&&<Link href={`/compounds/${best.slug}`} className="p-5 border border-emerald-300/30 rounded-2xl">Best Overall: {best.displayName||best.name}</Link>}
        {budget&&<Link href={`/compounds/${budget.slug}`} className="p-5 border border-white/10 rounded-2xl">Best Budget: {budget.displayName||budget.name}</Link>}
        {studied&&<Link href={`/compounds/${studied.slug}`} className="p-5 border border-white/10 rounded-2xl">Most Studied: {studied.displayName||studied.name}</Link>}
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Stacks</h2>
        <div className="flex gap-3 flex-wrap">
          {relatedStacks.map(s=> <Link key={s.slug} href={`/stacks/${s.slug}`}>{s.title}</Link>)}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Top Compounds</h2>
        <div className="flex gap-3 flex-wrap">
          {ranked.slice(0,6).map(c=> <Link key={c.slug} href={`/compounds/${c.slug}`}>{c.displayName||c.name}</Link>)}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Comparisons</h2>
        <div className="flex gap-3 flex-wrap">
          {comparisons.map(c=> <Link key={c.slug} href={`/compare/${c.slug}`}>{c.title}</Link>)}
        </div>
      </section>

      <section className="border border-amber-300/20 p-4 rounded-2xl">
        <p className="text-white/70">{goal.safetyNote}</p>
      </section>

      <section className="flex gap-4">
        <Link href="/stacks">Browse stacks</Link>
        <Link href="/compounds">Browse compounds</Link>
      </section>
    </main>
  )
}
