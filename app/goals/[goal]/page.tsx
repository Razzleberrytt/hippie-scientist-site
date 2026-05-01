import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import stacksData from '@/public/data/stacks.json'

const supportedGoals = ['sleep','stress','fat-loss','cognition','performance']
const stacks = stacksData as any[]

const goalLabel=(g:string)=>g.split('-').map(p=>p[0].toUpperCase()+p.slice(1)).join(' ')

export function generateStaticParams(){return supportedGoals.map(goal=>({goal}))}

export function generateMetadata({params}:{params:{goal:string}}):Metadata{
  const label=goalLabel(params.goal)
  return{title:`Best Supplements for ${label} | The Hippie Scientist`,description:`Science-backed supplements for ${params.goal}. Learn dosage, effects, and safety.`}
}

export default function Page({params}:{params:{goal:string}}){
  if(!supportedGoals.includes(params.goal))return notFound()

  const label=goalLabel(params.goal)
  const stack=stacks.find(s=>s.slug===params.goal||s.goal===params.goal.replace('-','_'))

  return(
    <div className='space-y-8'>
      <section className='rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8'>
        <h1 className='text-4xl font-black text-white'>Best Supplements for {label}</h1>
        <p className='text-white/80'>Science-backed compounds, dosage guidance, and safety insights.</p>
      </section>

      {stack&&(
        <section className='rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5'>
          <h2 className='text-2xl font-bold text-white'>Top Stack</h2>
          <Link href={`/stacks/${stack.slug}`} className='mt-3 inline-flex min-h-11 items-center rounded-2xl bg-emerald-300 px-5 py-2 font-bold text-black'>View Stack</Link>
        </section>
      )}

      <section className='rounded-3xl border border-white/10 p-5'>
        <h2 className='text-2xl font-bold text-white'>Explore Related Topics</h2>
        <div className='mt-3 flex flex-wrap gap-3'>
          {supportedGoals.map(g=> (
            <Link key={g} href={`/${g}-supplements`} className='rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5'>{goalLabel(g)}</Link>
          ))}
        </div>
      </section>
    </div>
  )
}
