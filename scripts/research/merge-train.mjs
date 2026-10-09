// Read-only merge decision engine. A separate authorized executor must re-check exact head before any mutation.
export function decide(pr,context){
 const reasons=[];
 if(pr.draft)reasons.push('draft');
 if(!pr.issue_linked||!pr.governance_complete)reasons.push('governance');
 if(!pr.independent_semantic_review)reasons.push('semantic review');
 if(pr.head_sha!==context.current_head_sha)reasons.push('stale head');
 if(pr.base_sha!==context.current_base_sha)reasons.push('stale base');
 if(pr.mergeable!==true)reasons.push('merge conflict or unknown');
 if(!pr.required_checks?.length||pr.required_checks.some(c=>c.head_sha!==pr.head_sha||c.conclusion!=='success'))reasons.push('exact-head checks');
 if(context.predecessor_pending)reasons.push('predecessor pending');
 return {number:pr.number,decision:reasons.length?'HOLD':'ELIGIBLE_FOR_AUTHORIZED_MERGE',reasons};
}
export function train(prs,contexts){return prs.map(p=>decide(p,contexts[String(p.number)]??{}))}
