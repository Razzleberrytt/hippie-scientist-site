function publicBlocker(value){
 const text=String(value??'').toLowerCase();if(!text)return null;
 if(text.includes('independent semantic')||text.includes('scientific review'))return 'Independent scientific review pending';
 if(text.includes('research rolling gate')||text.includes('exact-head')||text.includes('validation'))return 'Exact-head validation pending';
 if(text.includes('autonomous merge')||text.includes('merge train'))return 'Merge train pending';
 if(text.includes('closed without merge'))return 'Batch closed without merge';
 if(text.includes('permission')||text.includes('forbidden')||text.includes('authorized'))return 'Repository permission issue';
 if(text.includes('lifecycle'))return 'Lifecycle reconciliation issue';
 return 'Coordinator attention required';
}
export function summarizeRegistry(registry={}){
 const reservations=registry.reservations??[],batches=registry.batches??[];
 const active=reservations.filter(r=>!['MERGED','RELEASED'].includes(r.state));
 const byLane=Object.fromEntries([1,2,3,4,5].map(l=>[String(l),active.filter(r=>String(r.lane)===String(l)).length]));
 const byState={};for(const r of reservations)byState[r.state]=(byState[r.state]??0)+1;
 const batchRows=batches.map(b=>({id:b.id,state:b.state,count:reservations.filter(r=>r.batch_id===b.id).length,pr_number:b.pr_number??null,blocker:publicBlocker(b.blocker)}));
 return {schema_version:1,active_batch_id:registry.active_batch_id??null,total_reservations:active.length,by_lane:byLane,by_state:byState,batches:batchRows,incidents:(registry.incidents??[]).slice(-20).map(i=>({at:i.at??null,batch:i.batch??null,kind:i.class?.kind??'unknown',action:i.class?.action??'HOLD_AND_REPORT'}))};
}
export function renderSummaryMarkdown(summary){
 const lines=['## THS rolling research observatory','',`- Active batch: **${summary.active_batch_id??'none'}**`,`- Active reserved research identities: **${summary.total_reservations}**`,'','| Lane | Active reserved |','|---:|---:|',...Object.entries(summary.by_lane).map(([k,v])=>`| ${k} | ${v} |`),'','| Batch | State | Records | PR | Public blocker |','|---|---|---:|---:|---|',...summary.batches.slice(-12).map(b=>`| ${b.id} | ${b.state} | ${b.count} | ${b.pr_number??''} | ${b.blocker??''} |`)];
 return lines.join('\n')+'\n';
}
