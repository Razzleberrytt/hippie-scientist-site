import { notFound } from 'next/navigation'
import Link from 'next/link'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import { supplementComparisons } from '@/data/comparisons'
import StackCard from '@/components/StackCard'
import { getCompoundSearchLinks } from '@/src/lib/affiliate'
import type { Metadata } from 'next'

const stacks = stacksData as any[]
const compounds = ((compoundsData as any[]) || []).filter(Boolean)

const compoundMap = new Map(
  compounds
    .filter((c) => c?.slug)
    .map((c) => [c.slug as string, c])
)

const budgetFriendlySlugs = new Set([
  'caffeine','creatine','magnesium','glycine','melatonin','l-theanine','capsaicin'
])

export async function generateStaticParams(){return stacks.map((s)=>({slug:s.slug}))}

export function generateMetadata({params}:{params:{slug:string}}):Metadata{
  const stack=stacks.find((s)=>s.slug===params.slug)
  const goal=stack?.goal?.replace(/[-_]/g,' ')||'supplements'
  return{title:`Best Supplements for ${goal} (Stack Guide)`,description:`Science-backed supplement stack for ${goal}. Dosage, timing, and safety included.`}
}

const formatName=(slug:string)=>slug.split('-').filter(Boolean).map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(' ')
const normalizeGoal=(goal?:string)=>(goal||'').replace(/_/g,'-').toLowerCase()
const toNumber=(v:unknown)=>Number.isFinite(Number(v))?Number(v):0

const evidenceRank=(c:any)=>{
  const t=`${c?.evidence_grade??''} ${c?.evidenceTier??''} ${c?.tier_level??''}`.toLowerCase()
  if(/strong|tier\s*1|a/.test(t))return 4
  if(/moderate|tier\s*2|b/.test(t))return 3
  if(/limited|tier\s*3|c/.test(t))return 2
  return 1
}

const rankingLabelsFor=(items:any[])=>{
  const enriched=items.map((item)=>({item,compound:compoundMap.get(item.compound)}))
  const labels=new Map<string,string[]>()
  const add=(slug:string|undefined,label:string)=>{
    if(!slug)return
    const cur=labels.get(slug)||[]
    if(!cur.includes(label))labels.set(slug,[...cur,label])
  }
  const bestOverall=[...enriched].sort((a,b)=>toNumber(b.compound?.fact_score_v2)-toNumber(a.compound?.fact_score_v2))[0]
  add(bestOverall?.item?.compound,'Best Overall')
  const mostStudied=[...enriched].sort((a,b)=>evidenceRank(b.compound)-evidenceRank(a.compound))[0]
  add(mostStudied?.item?.compound,'Most Studied')
  const bestBudget=enriched.find(e=>budgetFriendlySlugs.has(e.item.compound))||enriched[0]
  add(bestBudget?.item?.compound,'Best Budget')
  return labels
}

const relatedStacksFor=(stack:any)=>{
  const goal=normalizeGoal(stack.goal)
  const same=stacks.filter(s=>s.slug!==stack.slug&&normalizeGoal(s.goal)===goal)
  return same.length?same:stacks.filter(s=>s.slug!==stack.slug).slice(0,3)
}

export default function StackPage({params}:{params:{slug:string}}){
  const stack=stacks.find((s)=>s.slug===params.slug)
  if(!stack)return notFound()

  const labels=rankingLabelsFor(stack.stack||[])
  const stackCompounds=(stack.stack||[]).map((item:any)=>({item,compound:compoundMap.get(item.compound)}))
  const compoundSlugs=new Set(stackCompounds.map(({item}:any)=>item.compound))

  const relatedComparisons=supplementComparisons.filter(c=>
    c.a.candidates.some(x=>compoundSlugs.has(x))||
    c.b.candidates.some(x=>compoundSlugs.has(x))
  ).slice(0,4)

  const relatedStacks=relatedStacksFor(stack)

  return(
    <div className='space-y-10'>
      <section>
        <h1 className='text-4xl font-black text-white'>{stack.title}</h1>
        <p className='text-white/80'>{stack.short_description}</p>
      </section>

      {relatedComparisons.length>0&&(
        <section>
          <h2 className='text-xl font-bold text-white'>Relevant comparisons</h2>
          <div className='mt-2 flex flex-wrap gap-2'>
            {relatedComparisons.map(c=>(
              <Link key={c.slug} href={`/compare/${c.slug}`} className='text-sm text-emerald-300'>
                {c.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className='space-y-6'>
        <h2 className='text-2xl font-bold text-white'>Stack Breakdown</h2>
        <div className='grid gap-5'>
          {stackCompounds.map(({item,compound}:any,i:number)=>{
            const label=compound?.displayName||compound?.name||formatName(item.compound)
            const links=getCompoundSearchLinks(label)
            const badges=labels.get(item.compound)||[]
            return(
              <div key={i} className='space-y-4 rounded-2xl border border-white/10 p-5'>
                {badges.map(b=> <span key={b} className='text-xs text-amber-200'>{b}</span>)}
                <StackCard item={item}/>
                <div className='flex gap-2'>{links.map((l:any)=>(<a key={l.label} href={l.url}>{l.label}</a>))}</div>
                {compound?.slug&&<Link href={`/compounds/${compound.slug}`}>Learn more →</Link>}
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className='font-bold text-white'>Related goals</h2>
        <div className='flex gap-2 flex-wrap'>
          {relatedStacks.map((s:any)=>(<Link key={s.slug} href={`/stacks/${s.slug}`}>{s.title}</Link>))}
        </div>
      </section>
    </div>
  )
}
