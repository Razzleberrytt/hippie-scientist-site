'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type Batch = { id:string; state:string; count:number; pr_number:number|null; blocker:string|null }
type Snapshot = {
  schema_version:number
  active_batch_id:string|null
  total_reservations:number
  by_lane:Record<string,number>
  by_state:Record<string,number>
  batches:Batch[]
  incidents:Array<{at:string|null;batch:string|null;kind:string;action:string}>
}
type Props = {
  mergedThroughWave:number
  mergedIndexedPmids:number
  latestSourceVerified:number
}

const SNAPSHOT_URL='https://raw.githubusercontent.com/Razzleberrytt/hippie-scientist-site/research-coordination-registry/ops/research-coordinator/public-observatory.json'

function valid(value:unknown): value is Snapshot {
  const x=value as Snapshot
  return Boolean(x&&x.schema_version===1&&typeof x.total_reservations==='number'&&x.by_lane&&x.by_state&&Array.isArray(x.batches)&&Array.isArray(x.incidents))
}

export default function ResearchOperationsClient({mergedThroughWave,mergedIndexedPmids,latestSourceVerified}:Props){
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const load=useCallback(async()=>{
    setLoading(true);setError('')
    try{
      const response=await fetch(SNAPSHOT_URL,{cache:'no-store'})
      if(!response.ok)throw new Error('Live coordinator snapshot unavailable')
      const data:unknown=await response.json()
      if(!valid(data))throw new Error('Live coordinator snapshot failed integrity checks')
      setSnapshot(data)
    }catch{
      setSnapshot(null)
      setError('Live lane telemetry is unavailable right now. Merged research metrics below remain authoritative.')
    }finally{setLoading(false)}
  },[])
  useEffect(()=>{void load()},[load])

  const blockers=useMemo(()=>snapshot?.batches.filter(b=>Boolean(b.blocker))??[],[snapshot])
  const active=snapshot?.batches.find(b=>b.id===snapshot.active_batch_id)

  return <div className='space-y-6'>
    <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4' aria-label='Research operations metrics'>
      {[
        {label:'Merged research index',value:mergedIndexedPmids,note:'authoritative PMIDs on main'},
        {label:'Through wave',value:mergedThroughWave,note:'latest merged research wave'},
        {label:'Latest source-verified batch',value:latestSourceVerified,note:'research-only records'},
        {label:'Live reservations',value:snapshot?.total_reservations??0,note:snapshot?'coordination registry':'live telemetry unavailable'},
      ].map(item=><div key={item.label} className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
        <p className='text-3xl font-bold tabular-nums text-ink'>{item.value.toLocaleString()}</p>
        <h2 className='mt-2 text-sm font-semibold text-ink'>{item.label}</h2>
        <p className='mt-1 text-xs leading-5 text-muted'>{item.note}</p>
      </div>)}
    </section>

    <section className='rounded-[1.5rem] border border-brand-900/10 bg-white p-5 shadow-sm sm:p-7'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <p className='eyebrow-label'>Five-lane research engine</p>
          <h2 className='mt-2 text-2xl font-bold tracking-tight text-ink'>Lane health</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-muted'>Counts are reservations in the coordination registry—not published evidence or treatment claims.</p>
        </div>
        <button type='button' onClick={()=>void load()} disabled={loading}
          className='min-h-11 rounded-full border border-brand-900/15 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-60'>
          {loading?'Refreshing…':'Refresh live status'}
        </button>
      </div>
      {error?<p role='status' className='mt-4 rounded-xl border border-amber-700/20 bg-amber-50 p-3 text-sm text-amber-950'>{error}</p>:null}
      <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
        {[
          ['1','Sleep · stress · mood'],
          ['2','Cognition · metabolic'],
          ['3','Botanicals · pharmacology · safety'],
          ['4','Withdrawal · dependence · NPS'],
          ['5','Contradictions · replication'],
        ].map(([lane,label])=><div key={lane} className='rounded-xl border border-brand-900/10 bg-brand-50/40 p-4'>
          <p className='text-xs font-bold uppercase tracking-wider text-brand-700'>Lane {lane}</p>
          <p className='mt-2 text-2xl font-bold tabular-nums text-ink'>{(snapshot?.by_lane?.[lane]??0).toLocaleString()}</p>
          <p className='mt-1 text-xs leading-5 text-muted'>{label}</p>
        </div>)}
      </div>
    </section>

    <section className='grid gap-4 lg:grid-cols-[1.3fr_.7fr]'>
      <div className='rounded-[1.5rem] border border-brand-900/10 bg-white p-5 shadow-sm sm:p-7'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <p className='eyebrow-label'>Rolling 500 train</p>
            <h2 className='mt-2 text-2xl font-bold tracking-tight text-ink'>Batch state</h2>
          </div>
          <p className='text-xs text-muted'>Active: {snapshot?.active_batch_id??'unknown'}</p>
        </div>
        <div className='mt-5 overflow-x-auto'>
          <table className='w-full min-w-[620px] text-left text-sm'>
            <thead><tr className='border-b border-brand-900/10 text-xs uppercase tracking-wider text-muted'><th className='py-2 pr-4'>Batch</th><th className='py-2 pr-4'>State</th><th className='py-2 pr-4'>Records</th><th className='py-2 pr-4'>PR</th><th className='py-2'>Blocker</th></tr></thead>
            <tbody>{(snapshot?.batches??[]).slice().reverse().slice(0,12).map(batch=><tr key={batch.id} className='border-b border-brand-900/5 align-top'>
              <td className='py-3 pr-4 font-semibold text-ink'>{batch.id}</td><td className='py-3 pr-4'>{batch.state}</td><td className='py-3 pr-4 tabular-nums'>{batch.count}</td><td className='py-3 pr-4'>{batch.pr_number??'—'}</td><td className='py-3 text-muted'>{batch.blocker??'—'}</td>
            </tr>)}</tbody>
          </table>
          {!snapshot?.batches?.length?<p className='py-6 text-sm text-muted'>No live batch snapshot available.</p>:null}
        </div>
      </div>

      <aside className='rounded-[1.5rem] border border-brand-900/10 bg-white p-5 shadow-sm sm:p-7'>
        <p className='eyebrow-label'>Failure isolation</p>
        <h2 className='mt-2 text-2xl font-bold tracking-tight text-ink'>Current blockers</h2>
        <p className='mt-2 text-sm leading-6 text-muted'>{blockers.length} batch blocker{blockers.length===1?'':'s'} visible in the sanitized coordinator snapshot.</p>
        <div className='mt-4 space-y-3'>
          {blockers.slice(0,8).map(b=><div key={b.id} className='rounded-xl border border-brand-900/10 bg-brand-50/40 p-3'>
            <p className='text-sm font-semibold text-ink'>{b.id}</p><p className='mt-1 text-xs leading-5 text-muted'>{b.blocker}</p>
          </div>)}
          {!blockers.length?<p className='rounded-xl bg-brand-50 p-3 text-sm text-muted'>{snapshot?'No batch blockers reported.':'Live blocker telemetry unavailable.'}</p>:null}
        </div>
        {active?<p className='mt-4 text-xs leading-5 text-muted'>Current active batch contains {active.count} reserved record{active.count===1?'':'s'}.</p>:null}
      </aside>
    </section>

    <p className='text-xs leading-6 text-muted'>Operational telemetry is intentionally separate from the evidence database. A reserved, verified, staged, or review-pending record is not automatically a published entity, dosing claim, safety conclusion, or recommendation.</p>
  </div>
}
