#!/usr/bin/env node
// Evidence-only status reconciliation. Never changes publishing or merge permission.
// Usage: node research/evidencemotion-director/build_atomic_lane_progress.mjs --write|--check [--compare OLD.json]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import console from "node:console";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
const dir = path.dirname(fileURLToPath(import.meta.url));
const read=(name)=>fs.readFileSync(path.join(dir,name),"utf8");
const buildReport=function buildReport(input) {
  const {ledger, checklist, atomicFiles}=input;
  const names=["Operating & Science","Voice & Word Timing","Cinematography & Craft","Mobile, Technical QA & Safety","Production & Operations"];
  const sources=["atomic/01-operating-science.md","atomic/02-narration-timing.md","atomic/03-direction-craft.md","atomic/04-trust-mobile.md","atomic/05-canonical-promotion.md"];
  const expected=[245,289,332,373,351];
  // Frozen exact Git blob identities of ALL five canonical stage-definition
  // documents. A changed requirement with unchanged EM ID must fail closed
  // before any old receipt can be reused as evidence. A revision requires
  // explicit source + receipt review and a separate updated frozen baseline.
  const atomicBlobs=[
    "07166394f7a9012cdaa3cef40d328efc947dbee6",
    "336b5308c15603e686981ccd1a2979b09e2618e9",
    "a555c9110fb6c19c34950fda05dc3a6fe9da1403",
    "7925fb054692f24d0714c2cdd78aba4e87a39b7d",
    "24b65f5721614be2a514241f036f398ca68f5373"
  ];
  for(let i=0;i<atomicFiles.length;i++){
    const doc=atomicFiles[i];
    const gitBlob=createHash("sha1").update("blob "+Buffer.byteLength(doc,"utf8")+"\0","utf8")
      .update(doc,"utf8").digest("hex");
    if(gitBlob!==atomicBlobs[i]) throw Error("ATOMIC_STAGE_DEFINITION_DRIFT_HOLD:"+sources[i]);
  }

  const denominator=ledger.denominator;
  const accepted=[...checklist.matchAll(/^- \[([x ])\] /gm)].map(x=>x[1]==="x");
  if (accepted.length!==46) throw Error("Cannot safely parse exact 46 canonical checklist rows: "+accepted.length);
  if (ledger.mayPublish!==false) throw Error("Reporting must remain non-publishing");
  if (denominator!==1590) throw Error("Planning denominator changed; reconcile before reporting");
  // Require the independent first-party evidence validator to check actual
  // receipt files/rows, source pins and merge/run contracts before tallying any
  // research card. A ledger declaration alone is never an audit.
  const checked=spawnSync("python3",[path.join(dir,"validate_atomic_proof_ledger.py")],
    {cwd:dir,encoding:"utf8",maxBuffer:2*1024*1024,timeout:15000});
  if(checked.error||checked.status!==0) throw Error("ATOMIC_RECEIPT_VALIDATION_HOLD: "+
    String(checked.stderr||checked.error||"validator did not pass").slice(0,900));
  let validated;
  try {validated=JSON.parse(checked.stdout);} catch {
    throw Error("ATOMIC_RECEIPT_VALIDATION_HOLD:INVALID_VALIDATOR_OUTPUT");
  }
  if(validated.mayPublish!==false||validated.totalAtomicTemplates!==denominator||
     !Array.isArray(validated.individualResearchCardIDs))
    throw Error("ATOMIC_RECEIPT_VALIDATION_HOLD:INVALID_VALIDATOR_SCOPE");
  const provenIds=new Set(validated.individualResearchCardIDs);
  if(provenIds.size!==validated.individualResearchCardIDs.length)
    throw Error("ATOMIC_RECEIPT_VALIDATION_HOLD:DUPLICATE_VERIFIED_ID");

  const audits=new Map(),duplicates=[];
  for (const group of ledger.proofGroups) {
    for (const id of group.cards) {
      if (audits.has(id)) duplicates.push(id);
      audits.set(id,{group:group.group,source:group.source});
    }
  }
  if (duplicates.length) throw Error("Duplicate proof cards: "+duplicates.join(", "));
  if (provenIds.size!==audits.size||[...audits.keys()].some(id=>!provenIds.has(id)))
    throw Error("ATOMIC_RECEIPT_VALIDATION_HOLD:CLAIMS_NOT_IN_VALIDATED_RECEIPTS");
  const byId=new Map();
  const lanes=atomicFiles.map((file,i)=>{
    const titles=new Map([...file.matchAll(/^### (EM-\d{3}\.\d{2}) — ([^\n]+)$/gm)].map(m=>[m[1],m[2].trim()]));
    const matches=[...file.matchAll(/^- \[([ x])\] \*\*(EM-\d{3}\.\d{2}\.([USOXTNR]))\*\*/gm)];
    const cards=matches.map(m=>{
      const id=m[2],taskId=id.slice(0,9),parent=id.slice(0,6),stage=m[3],priorAccepted=accepted[Number(parent.slice(3))-1]===true;
      if (byId.has(id)) throw Error("Duplicate canonical card: "+id);
      if (!titles.has(taskId)) throw Error("Unheaded canonical task: "+taskId);
      const proof=audits.get(id)||null;
      const state=proof?(priorAccepted?"M+I":"M"):(priorAccepted?"I":"?");
      const card={id,taskId,parent,stage,state,machine:!!proof,inherited:priorAccepted,source:proof?.source||null};
      byId.set(id,card);
      return card;
    });
    if (cards.length!==expected[i]) throw Error("Lane "+(i+1)+" inventory changed: "+cards.length);
    const taskMap=new Map();
    for (const c of cards) {
      if (!taskMap.has(c.taskId)) taskMap.set(c.taskId,{id:c.taskId,title:titles.get(c.taskId),parent:c.parent,cards:[]});
      taskMap.get(c.taskId).cards.push(c);
    }
    const tasks=[...taskMap.values()];
    const parents=[];
    for (const p of new Set(tasks.map(t=>t.parent))) {
      parents.push({id:p,accepted:accepted[Number(p.slice(3))-1],tasks:tasks.filter(t=>t.parent===p)});
    }
    const tally=(arr)=>({total:arr.length,machine:arr.filter(c=>c.machine).length,inherited:arr.filter(c=>c.inherited).length,overlap:arr.filter(c=>c.machine&&c.inherited).length,unique:arr.filter(c=>c.machine||c.inherited).length,unmapped:arr.filter(c=>!c.machine&&!c.inherited).length});
    const stat=tally(cards);
    const pct=n=>Number((100*n/stat.total).toFixed(2));
    return {lane:i+1,name:names[i],source:sources[i],stats:{...stat,machinePercent:pct(stat.machine),mappedPercent:pct(stat.unique),inheritedPercent:pct(stat.inherited)},parents:parents.map(p=>({...p,stats:tally(p.tasks.flatMap(t=>t.cards))})),tasks:tasks.map(t=>({...t,stats:tally(t.cards)}))};
  });
  const all=[...byId.values()];
  if(all.length!==denominator) throw Error("Canonical 1590 card crosswalk incomplete");
  // Cross-check both separately declared planning sources. A metadata-only
  // change to the 243-item register or 46-item index cannot bypass --check.
  const registered=[...read("GRANULAR-46-EXECUTION-REGISTER.md").matchAll(
    /^- \[([ x])\] \*\*(EM-\d{3}\.\d{2})\*\*/gm)].map(m=>m[2]);
  const actualTasks=new Set(lanes.flatMap(l=>l.tasks.map(t=>t.id)));
  if(registered.length!==243||new Set(registered).size!==243||
     registered.some(id=>!actualTasks.has(id)))
    throw Error("ATOMIC_INVENTORY_HOLD:243_TASK_REGISTER_MISMATCH");
  const indexRows=[...read("ATOMIC-EXECUTION-INDEX.md").matchAll(
    /^\| (EM-\d{3}) \| (\d+) \| (\d+) \|/gm)];
  if(indexRows.length!==46) throw Error("ATOMIC_INVENTORY_HOLD:46_MILESTONE_INDEX_REQUIRED");
  const seenParents=new Set();
  for(const m of indexRows){
    const p=m[1];if(seenParents.has(p))throw Error("ATOMIC_INVENTORY_HOLD:DUPLICATE_INDEX_PARENT");
    seenParents.add(p);
    const tasks=lanes.flatMap(l=>l.tasks).filter(t=>t.parent===p);
    const stages=tasks.reduce((n,t)=>n+t.cards.length,0);
    if(tasks.length!==Number(m[2])||stages!==Number(m[3]))
      throw Error("ATOMIC_INVENTORY_HOLD:INDEX_PARENT_COUNT_MISMATCH:"+p);
  }
  if(lanes.flatMap(l=>l.tasks).some(t=>!seenParents.has(t.parent)))
    throw Error("ATOMIC_INVENTORY_HOLD:MISSING_PARENT_IN_INDEX");
  const orphan=[...audits.keys()].filter(id=>!byId.has(id)).sort();
  const inherited=all.filter(c=>c.inherited).length;
  const individuallyMapped=all.filter(c=>c.machine).length;
  const overlap=all.filter(c=>c.machine&&c.inherited).length;
  const unique=all.filter(c=>c.machine||c.inherited).length;
  const rawVerified=audits.size;
  const claimed=ledger.provisionalCoverageCardCount;
  if (inherited!==ledger.inheritedMappedToAcceptedFoundationsNotIndividuallyAudited)
    throw Error("Canonical inherited parent credit does not match ledger");
  if (rawVerified!==ledger.individualMachineVerifiedResearchCardCount)
    throw Error("Ledger individual proof total invalid");
  if (claimed!==inherited+rawVerified && claimed!==unique)
    throw Error("Ledger rollup must be raw historic total or actual deduplicated canonical coverage");
  if (lanes.reduce((n,l)=>n+l.tasks.length,0)!==243) throw Error("Expected exactly 243 microtasks");
  const global={total:denominator,machine:individuallyMapped,rawMachineClaimed:rawVerified,inherited,overlap,unique,unmapped:denominator-unique,orphanCards:orphan,ledgerClaimedProvisional:claimed,ledgerClaimedPercent:ledger.provisionalCoveragePercent,reconciledMappedPercent:Number((100*unique/denominator).toFixed(2)),machinePercent:Number((100*individuallyMapped/denominator).toFixed(2)),inflation:claimed-unique,acceptedParents:accepted.filter(Boolean).length,totalParents:accepted.length,totalTasks:243};
  const stateLegend="`M` = individually machine-research audited, **not release accepted**; `I` = inherited canonical-parent scope, **not separately audited**; `M+I` = both (must not double count); `?` = not independently evidenced. Neither `M` nor `I` alone establishes final video quality, real-phone approval, independent science review, merge or posting.";
  const lines=[
    "# EvidenceMotion — Evidence-Bound Sub-Atomic Lane Progress",
    "",
    "**Ledger date:** "+(ledger.recordedDate||"Unknown")+" · **Source:** [canonical 46](COMPLETION-CHECKLIST.md), [243-task register](GRANULAR-46-EXECUTION-REGISTER.md), [1,590-card index](ATOMIC-EXECUTION-INDEX.md), [research proof ledger](ATOMIC-PROOF-LEDGER-20261015.json).",
    "",
    "> **Machine-generated research-only reconciliation.** This report is deliberately not the authoritative acceptance or publication ledger. Never use a percentage to override a failed stage, reviewer gate, WIP, exact-head CI, qualified science, craft, real-handset, publication or merge controller. Today's individually verified research stages do not imply videos are fit to publish.",
    "",
    "## Exact accounting and discrepancy alert",
    "",
    `- **Canonical accepted parents:** ${global.acceptedParents}/${global.totalParents}. **243 subtasks and 1,590 stages inventoried**; creation of the plan earns zero implementation credit.`,
    `- **Individually reconciled machine-research stages:** ${global.machine}/${global.total} (${global.machinePercent}%). The proof ledger separately claims ${global.rawMachineClaimed}, of which **${orphan.length}** cannot be located in the frozen template inventory.`,
    `- **Inherited historical milestone scope:** ${global.inherited}/${global.total}, of which **${global.overlap}** also appear in individually audited groups. Never add these overlapping counts twice.`,
    `- **Unique stages mapped to at least one proof class (still provisional):** ${global.unique}/${global.total} (${global.reconciledMappedPercent}%). **Not evidenced by either class:** ${global.unmapped}/${global.total}.`,
    (claimed===unique
      ? `- **Reconciled distinct research-stage headline:** ${global.unique}/${global.total} (${global.reconciledMappedPercent}%) is the physical canonical union, with ${global.overlap} legitimate inherited/machine overlaps counted once and ${orphan.length} uncounted orphan proof(s). Still provisional, never quality accepted.`
      : `- **Original ledger's nominal provisional headline:** ${global.ledgerClaimedProvisional}/${global.total} (${global.ledgerClaimedPercent}%), which exceeds the unique inventory mapping by **${global.inflation}** card credits (${global.overlap} inherited/machine overlaps plus ${orphan.length} unmatched card). **HOLD arithmetic reconciliation**, not silent acceptance or a denominator change.`),
    `- **Unmatched card IDs:** ${orphan.length?orphan.map(c=>"`"+c+"`").join(", "):"none"}. Source group evidence is retained, but the ID gets no counted percentage until the canonical inventory and proof validator are reconciled.`,
    "- **Excellent first native render and five-render streak:** no new acceptance established by this progress report; read the [46-milestone checklist](COMPLETION-CHECKLIST.md) for actual release gates. `mayPublish=false` remains mandatory.",
    "",
    "## Five-lane overview",
    "",
    "| Lane | Canonical atoms | Machine-audited research | Inherited (includes overlap) | M+I overlap | Not mapped | Audited % | Unique mapped % | Canonical parents accepted |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|"
  ];
  for(const l of lanes) lines.push(`| ${l.lane}. ${l.name} | ${l.stats.total} | ${l.stats.machine} | ${l.stats.inherited} | ${l.stats.overlap} | ${l.stats.unmapped} | ${l.stats.machinePercent}% | ${l.stats.mappedPercent}% | ${l.parents.filter(p=>p.accepted).length}/${l.parents.length} |`);
  lines.push("","### Reading the step-level columns","",stateLegend,"",
    "Each microtask's **audited %** is the fraction of its `U/S/O/X/T/N/R` stages backed by individual machine-research proof. **Mapped %** is the number of *distinct* stages with machine proof or inherited parent scope divided by the task's frozen stage count. These are not engineering effort estimates, clinical approval, user quality ratings, or a guess at elapsed time.",
    "",
    "## Actions if progress looks frozen","",
    "1. Run `node research/evidencemotion-director/build_atomic_lane_progress.mjs --check` to see whether this checked-in report matches the latest committed source. Run `--write` only on the scoped existing authorized owner branch to regenerate the Markdown and JSON together.",
    "2. Record per-lane current exact PR/head, test run, failing card IDs, owner/dependency and next executable action **alongside**, not inside, the numerator. Compare the latest generated JSON with a previous checkpoint via `--compare path/to/older/ATOMIC-LANE-PROGRESS.json` to show every lane's actual evidenced changes and NO_GAIN notices.",
    "3. If a lane has zero **new** audited stage IDs across two substantive evidence updates, mark it `STALLED—RECONCILE`; identify the first failing/blocked step and its missing source, real media, negative case, reviewer, CI, handset or authorization. Reassign existing WIP before opening new tickets. A report refresh alone is not progress.",
    "4. Separate reusable EvidenceMotion lane development from today's individual video production. The 3-slot D/R/A admission limit and sole authorized protected-merge controller continue to govern; no publishing permission is conferred.",
    ""
  );
  const stageOrder=["U","S","O","X","T","N","R"];
  for(const l of lanes){
    lines.push(`## Lane ${l.lane} — ${l.name}`,"",
      `Source [atomic workcards](${l.source}). **${l.stats.machine}/${l.stats.total} = ${l.stats.machinePercent}% individually research-audited; ${l.stats.unique}/${l.stats.total} = ${l.stats.mappedPercent}% uniquely mapped provisional.** ${l.stats.unmapped} stages have no reconciled proof class. Canonical parents ${l.parents.filter(p=>p.accepted).length}/${l.parents.length} accepted.`,
      "",
      "| Milestone | Canonical state | Atomic stages | Machine research | Inherited | Overlap | Not mapped | Audited % | Unique mapped % |",
      "|---|---|---:|---:|---:|---:|---:|---:|");
    for(const p of l.parents){
      const s=p.stats;
      lines.push(`| \`${p.id}\` | ${p.accepted?"Accepted (historical)":"Open"} | ${s.total} | ${s.machine} | ${s.inherited} | ${s.overlap} | ${s.unmapped} | ${(100*s.machine/s.total).toFixed(2)}% | ${(100*s.unique/s.total).toFixed(2)}% |`);
    }
    lines.push("","### Every microtask — every atomic stage","",
      "| Task and required outcome | Stages | Audited research | Inherited | Not mapped | Audited % | Unique mapped % | U · S · O · X · T · N · R | Proof receipt |",
      "|---|---:|---:|---:|---:|---:|---:|---|---|");
    for(const t of l.tasks){
      const s=t.stats,stageMap=new Map(t.cards.map(c=>[c.stage,c.state]));
      const stages=stageOrder.map(st=>stageMap.has(st)?`${st}:${stageMap.get(st)}`:`${st}:—`).join(" ");
      const proofs=[...new Set(t.cards.map(c=>c.source).filter(Boolean))].sort();
      const links=proofs.map(path=>`[receipt](${path})`).join(" ");
      const safeTitle=t.title.replace(/\|/g,"/").replace(/`/g,"'");
      lines.push(`| \`${t.id}\` ${safeTitle} | ${s.total} | ${s.machine} | ${s.inherited} | ${s.unmapped} | ${(100*s.machine/s.total).toFixed(2)}% | ${(100*s.unique/s.total).toFixed(2)}% | \`${stages}\` | ${links||"—"} |`);
    }
    lines.push("");
  }
  const report=lines.join("\n")+"\n";
  const snapshot={
    schema:"ths-evidencemotion-lane-atomic-progress-v1",
    ledgerRecordedDate:ledger.recordedDate||null,
    status:"RESEARCH_ONLY_NOT_RELEASE_ACCEPTANCE",
    mayPublish:false,
    sourceFiles:["COMPLETION-CHECKLIST.md","GRANULAR-46-EXECUTION-REGISTER.md","ATOMIC-PROOF-LEDGER-20261015.json",...sources],
    global,
    lanes:lanes.map(l=>({lane:l.lane,name:l.name,source:l.source,stats:l.stats,
      parents:l.parents.map(p=>({id:p.id,accepted:p.accepted,stats:p.stats})),
      tasks:l.tasks.map(t=>({id:t.id,parent:t.parent,title:t.title,stats:t.stats,
        stages:t.cards.map(c=>({id:c.id,stage:c.stage,state:c.state,proofSource:c.source}))}))
    }))
  };
  return {report,snapshot,summary:{total:all.length,taskCount:lanes.reduce((n,l)=>n+l.tasks.length,0),orphans:orphan,machine:global.machine,inherited:global.inherited,overlap:global.overlap,unique:global.unique,claimed:claimed,lanes:lanes.map(l=>({lane:l.lane,...l.stats}))}};
};
const input={
 ledger:JSON.parse(read("ATOMIC-PROOF-LEDGER-20261015.json")),
 checklist:read("COMPLETION-CHECKLIST.md"),
 atomicFiles:["atomic/01-operating-science.md","atomic/02-narration-timing.md","atomic/03-direction-craft.md","atomic/04-trust-mobile.md","atomic/05-canonical-promotion.md"].map(read)
};
const result=buildReport(input);
const markdownFile=path.join(dir,"ATOMIC-LANE-PROGRESS.md");
const jsonFile=path.join(dir,"ATOMIC-LANE-PROGRESS.json");
const json=JSON.stringify(result.snapshot,null,2)+"\n";
const args=process.argv.slice(2);
if(args.includes("--compare")){
  const n=args.indexOf("--compare");
  if(!args[n+1]) throw Error("--compare requires an existing JSON checkpoint file");
  const prev=JSON.parse(fs.readFileSync(args[n+1],"utf8"));
  if(prev.schema!==result.snapshot.schema) throw Error("Comparison schema mismatch");
  const delta=result.snapshot.global.machine-prev.global.machine;
  console.log("Machine-audited unique card change: "+(delta>=0?"+":"")+delta);
  for (const l of result.snapshot.lanes) {
    const old=prev.lanes.find(x=>x.lane===l.lane);
    if(!old) throw Error("Missing previous lane "+l.lane);
    const oldStages=new Set(old.tasks.flatMap(t=>t.stages.filter(s=>s.state.includes("M")).map(s=>s.id)));
    const newStages=new Set(l.tasks.flatMap(t=>t.stages.filter(s=>s.state.includes("M")).map(s=>s.id)));
    const gained=[...newStages].filter(s=>!oldStages.has(s));
    const lost=[...oldStages].filter(s=>!newStages.has(s));
    console.log("Lane "+l.lane+": +"+gained.length+" / -"+lost.length+" verified research stages"+(gained.length===0?" — NO_GAIN, inspect actual blockers":""));
    if(gained.length) console.log("  Gained IDs: "+gained.join(", "));
    if(lost.length) console.log("  Removed IDs (audit): "+lost.join(", "));
  }
}
if(args.includes("--check")){
  if(!fs.existsSync(markdownFile)||!fs.existsSync(jsonFile)||read("ATOMIC-LANE-PROGRESS.md")!==result.report||read("ATOMIC-LANE-PROGRESS.json")!==json){
    console.error("ATOMIC_PROGRESS_HOLD: generated lane progress out of date; run --write on the authorized branch");
    process.exitCode=1;
  } else console.log("ATOMIC_PROGRESS_PASS: checked report matches current evidence");
} else if(args.includes("--write")){
  fs.writeFileSync(markdownFile,result.report);
  fs.writeFileSync(jsonFile,json);
  console.log("Wrote lane progress report and machine-readable snapshot; mayPublish=false");
} else if(!args.includes("--compare")) {
  console.log(JSON.stringify(result.summary,null,2));
  console.log("Use --write to refresh report, --check to verify, --compare OLD.json to diagnose stalls.");
}
