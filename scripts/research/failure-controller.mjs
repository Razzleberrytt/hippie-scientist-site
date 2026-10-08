export function classifyFailure(error){
 const status=Number(error?.status||0),message=String(error?.message||error||'');
 if(/source unavailable|source verification|efetch|pubmed.*unavailable|invalid source response/i.test(message))return {kind:'source',retry:true,maxAttempts:3,action:'RETRY_SOURCE_THEN_HOLD_RECORD'};
 if(/collision|duplicate|stale PR head|source title mismatch|invalid state|missing .*field|incomplete/i.test(message))return {kind:'validation',retry:false,action:'BLOCK_AND_REVIEW'};
 if(status===401||status===403||/permission|forbidden|not authorized/i.test(message))return {kind:'permission',retry:false,action:'ESCALATE_PERMISSION'};
 if(status===409||status===422||/conflict|head moved|compare-and-swap|stale registry/i.test(message))return {kind:'concurrency',retry:true,maxAttempts:3,action:'REFETCH_REVALIDATE_RETRY'};
 if(status===429||status>=500||/timeout|timed out|temporar|ECONNRESET|rate limit/i.test(message))return {kind:'transient',retry:true,maxAttempts:3,action:'BOUNDED_BACKOFF_RETRY'};
 if(/semantic review|governance|exact-head checks|predecessor pending/i.test(message))return {kind:'governance',retry:false,action:'HOLD_WITH_EXACT_BLOCKER'};
 return {kind:'unknown',retry:false,action:'HOLD_AND_REPORT'};
}
export async function withRecovery(fn,{sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 let last;
 for(let attempt=1;attempt<=3;attempt++){
  try{return await fn(attempt)}catch(error){
   last=error;const c=classifyFailure(error);
   if(!c.retry||attempt>=(c.maxAttempts||1)){error.failure_class=c;throw error}
   await sleep(250*2**(attempt-1));
  }
 }
 throw last;
}
