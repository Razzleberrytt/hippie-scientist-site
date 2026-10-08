export function summarizeRegistry(registry={}){
 const reservations=registry.reservations??[],batches=registry.batches??[];
 const byLane=Object.fromEntries([1,2,3,4,5].map(l=>[String(l),reservations.filter(r=>String(r.lane)===String(l)).length]));
 const byState={};
 for(const r of reservations)byState[r.state]=(byState[r.state]??0)+1;
 const batchRows=batches.map(b=>({id:b.id,state:b.state,count:reservations.filter(r=>r.batch_id===b.id).length,pr_number:b.pr_number??null,blocker:b.blocker??null}));
 return {schema_version:1,active_batch_id:registry.active_batch_id??null,total_reservations:reservations.length,by_lane:byLane,by_state:byState,batches:batchRows,incidents:(registry.incidents??[]).slice(-20)};
}
export function renderSummaryMarkdown(summary){
 const lines=['## THS rolling research observatory','',`- Active batch: **${summary.active_batch_id??'none'}**`,`- Reserved research identities: **${summary.total_reservations}**`,'','| Lane | Reserved |','|---:|---:|',...Object.entries(summary.by_lane).map(([k,v])=>`| ${k} | ${v} |`),'','| Batch | State | Records | PR | Blocker |','|---|---|---:|---:|---|',...summary.batches.slice(-12).map(b=>`| ${b.id} | ${b.state} | ${b.count} | ${b.pr_number??''} | ${b.blocker??''} |`)];
 return lines.join('\n')+'\n';
}
