#!/usr/bin/env node
// Proof integrity tests; fixtures are synthetic, never accepted completion.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import process from "node:process";

const root=path.dirname(fileURLToPath(import.meta.url));
const copy=(out,name)=>{
  const target=path.join(out,name);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(path.join(root,name),target);
};
function withFixture(callback){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"em-atomic-proof-"));
  try {
    const ledger=JSON.parse(fs.readFileSync(path.join(root,"ATOMIC-PROOF-LEDGER-20261015.json"),"utf8"));
    const names=[
      "build_atomic_lane_progress.mjs","validate_atomic_proof_ledger.py",
      "ATOMIC-PROOF-LEDGER-20261015.json","COMPLETION-CHECKLIST.md",
      "GRANULAR-46-EXECUTION-REGISTER.md","ATOMIC-EXECUTION-INDEX.md",
      "ATOMIC-LANE-PROGRESS.md","ATOMIC-LANE-PROGRESS.json",
      ...ledger.proofGroups.map(group=>group.source),
      ..."01-operating-science 02-narration-timing 03-direction-craft 04-trust-mobile 05-canonical-promotion".split(" ").map(name=>"atomic/"+name+".md")
    ];
    for(const name of new Set(names)) copy(tmp,name);
    callback(tmp,ledger);
  } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
}
function run(tmp){
  return spawnSync(process.execPath,[path.join(tmp,"build_atomic_lane_progress.mjs"),"--check"],
    {cwd:tmp,encoding:"utf8",timeout:12000,maxBuffer:2*1024*1024});
}
test("original real-source proof and 46/243/1590 canonical inventory pass",()=>{
  withFixture(tmp=>{
    const result=run(tmp);
    assert.equal(result.status,0,result.stderr||result.stdout);
    assert.match(result.stdout,/ATOMIC_PROGRESS_PASS/);
  });
});
test("missing receipt is rejected instead of preserving machine credit",()=>{
  withFixture((tmp,ledger)=>{
    fs.unlinkSync(path.join(tmp,ledger.proofGroups[0].source));
    const result=run(tmp);
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/ATOMIC_RECEIPT_VALIDATION_HOLD/);
  });
});
test("edited receipt removing a claimed VERIFIED row is rejected",()=>{
  withFixture((tmp,ledger)=>{
    fs.writeFileSync(path.join(tmp,ledger.proofGroups[0].source),"# Altered evidence without claimed verification rows\\n");
    const result=run(tmp);
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/ATOMIC_RECEIPT_VALIDATION_HOLD/);
  });
});
test("renamed task in 243-task register is rejected",()=>{
  withFixture(tmp=>{
    const p=path.join(tmp,"GRANULAR-46-EXECUTION-REGISTER.md");
    const original=fs.readFileSync(p,"utf8");
    assert.ok(original.includes("**EM-001.01**"));
    fs.writeFileSync(p,original.replace("**EM-001.01**","**EM-001.99**"));
    const result=run(tmp);
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/ATOMIC_INVENTORY_HOLD:243_TASK_REGISTER_MISMATCH/);
  });
});
test("edited milestone stage count in index is rejected",()=>{
  withFixture(tmp=>{
    const p=path.join(tmp,"ATOMIC-EXECUTION-INDEX.md");
    const original=fs.readFileSync(p,"utf8");
    assert.ok(original.includes("| EM-001 | 4 | 24 |"));
    fs.writeFileSync(p,original.replace("| EM-001 | 4 | 24 |","| EM-001 | 4 | 25 |"));
    const result=run(tmp);
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/ATOMIC_INVENTORY_HOLD:INDEX_PARENT_COUNT_MISMATCH:EM-001/);
  });
});

test("pull-request workflow covers every claimed root-level proof receipt and renders summary newlines",()=>{
  const workflow=fs.readFileSync(path.resolve(root,"../../.github/workflows/evidencemotion-progress-readout.yml"),"utf8");
  const prPaths=workflow.split("  pull_request:")[1]?.split("  workflow_dispatch:")[0]||"";
  const ledger=JSON.parse(fs.readFileSync(path.join(root,"ATOMIC-PROOF-LEDGER-20261015.json"),"utf8"));
  assert.ok(prPaths.includes("'research/evidencemotion-director/EM*.md'"),
    "Missing explicit root receipt trigger");
  for (const group of ledger.proofGroups) {
    assert.match(group.source,/^EM[^/]*[.]md$/,
      "Every current receipt must be covered by the EM*.md PR trigger: "+group.source);
  }
  const summary=workflow.split("      - name: Summarize real engineering activity without awarding cards")[1]
    ?.split("      - name: Preserve both snapshot and reviewed accounting")[0]||"";
  assert.ok(summary.includes("fp.write("),"Summary block missing");
  assert.equal(summary.includes(String.fromCharCode(92,92,110)),false,
    "Python must emit newline escapes rather than literal backslash-n text");
});

test("accounting step uses the same real discrepancy rule for HOLD and resolved ledgers",()=>{
  const workflow=fs.readFileSync(path.resolve(root,"../../.github/workflows/evidencemotion-progress-readout.yml"),"utf8");
  const step=workflow.split("      - name: Append exact five-lane stage evidence percentages")[1]
    ?.split("      - name: Read GitHub merged PRs into a fresh, time-stamped receipt")[0]||"";
  const block=step.split("          python - <<'PY'\n")[1]?.split("\n          PY")[0];
  assert.ok(block,"Accounting Python block missing");
  const script=block.split("\n").map(line=>line.replace(/^ {10}/,"")).join("\n");
  withFixture(tmp=>{
    const relative=path.join("research","evidencemotion-director","ATOMIC-LANE-PROGRESS.json");
    const dest=path.join(tmp,relative);
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    const original=JSON.parse(fs.readFileSync(path.join(root,"ATOMIC-LANE-PROGRESS.json"),"utf8"));
    for(const resolved of [false,true]){
      const input=JSON.parse(JSON.stringify(original));
      if(resolved){
        input.global.orphanCards=[];
        input.global.overlap=54; // legitimate category overlap is not arithmetic inflation
        input.global.inflation=0;
      }
      fs.writeFileSync(dest,JSON.stringify(input));
      const summary=path.join(tmp,"summary-"+resolved+".md");
      const result=spawnSync("python3",["-c",script],{
        cwd:tmp,encoding:"utf8",timeout:12000,
        env:{...process.env,GITHUB_STEP_SUMMARY:summary}});
      assert.equal(result.status,0,result.stderr);
      const output=fs.readFileSync(summary,"utf8");
      if(resolved){
        assert.match(output,/Distinct mapping reconciled \(research-only\)/);
        assert.doesNotMatch(output,/\*\*Arithmetic HOLD:/);
      }else{
        assert.match(output,/\*\*Arithmetic HOLD:/);
      }
    }
  });
});
test("evidence artifact physically includes byte-identical reconciled card inventory",()=>{
  const workflow=fs.readFileSync(path.resolve(root,"../../.github/workflows/evidencemotion-progress-readout.yml"),"utf8");
  const section=workflow.split("      - name: Preserve corrected 1590-card inventory alongside GitHub events")[1]
    ?.split("      - name: Preserve both snapshot and reviewed accounting")[0]||"";
  assert.ok(section.includes("atomic-lane-progress-reconciled.json"),
    "Artifact copy step missing");
  assert.ok(workflow.includes("path: ${{ runner.temp }}/em-progress/"),"Evidence upload path missing");
  const script=section.split("        run: |\n")[1]?.split("\n").filter(line=>line.trim())
    .map(line=>line.replace(/^ {10}/,"")).join("\n");
  assert.ok(script,"Artifact copy command missing");
  withFixture(tmp=>{
    const source=path.join(tmp,"research/evidencemotion-director/ATOMIC-LANE-PROGRESS.json");
    fs.mkdirSync(path.dirname(source),{recursive:true});
    fs.copyFileSync(path.join(root,"ATOMIC-LANE-PROGRESS.json"),source);
    fs.mkdirSync(path.join(tmp,"em-progress"),{recursive:true});
    const result=spawnSync("bash",["-c",script],{cwd:tmp,encoding:"utf8",timeout:12000,
      env:{...process.env,RUNNER_TEMP:tmp}});
    assert.equal(result.status,0,result.stderr);
    assert.deepEqual(fs.readFileSync(path.join(tmp,"em-progress/atomic-lane-progress-reconciled.json")),
      fs.readFileSync(source));
  });
});

test("change to a canonical stage instruction with identical ID fails closed",()=>{
  withFixture(tmp=>{
    const source=path.join(tmp,"atomic/01-operating-science.md");
    const current=fs.readFileSync(source,"utf8");
    const old="Register exactly **one hosted CPU execution** for this objective";
    assert.ok(current.includes(old),"Expected current stage definition missing");
    fs.writeFileSync(source,current.replace(old,
      "Register exactly **one invented completion** for this objective"));
    const result=run(tmp);
    assert.notEqual(result.status,0);
    assert.ok(result.stderr.includes("ATOMIC_STAGE_DEFINITION_DRIFT_HOLD:atomic/01-operating-science.md"),
      result.stderr);
  });
});

test("corrected deduplicated headline regenerates the same 1590-card union without manufacturing accepted credit",()=>{
  withFixture((tmp,ledger)=>{
    const input=JSON.parse(JSON.stringify(ledger));
    input.provisionalCoverageCardCount=820;
    input.provisionalCoveragePercent=Number((820/1590*100).toFixed(4));
    const ledgerPath=path.join(tmp,"ATOMIC-PROOF-LEDGER-20261015.json");
    fs.writeFileSync(ledgerPath,JSON.stringify(input));
    const write=spawnSync(process.execPath,[path.join(tmp,"build_atomic_lane_progress.mjs"),"--write"],{
      cwd:tmp,encoding:"utf8",timeout:12000,maxBuffer:2*1024*1024
    });
    assert.equal(write.status,0,write.stderr||write.stdout);
    const data=JSON.parse(fs.readFileSync(path.join(tmp,"ATOMIC-LANE-PROGRESS.json"),"utf8"));
    assert.equal(data.global.unique,820);
    assert.equal(data.global.machine,167);
    assert.equal(data.global.inflation,0);
    assert.equal(data.global.overlap,54);
    assert.equal(data.mayPublish,false);
    const check=run(tmp);
    assert.equal(check.status,0,check.stderr||check.stdout);
    assert.match(fs.readFileSync(path.join(tmp,"ATOMIC-LANE-PROGRESS.md"),"utf8"),
      /Reconciled distinct research-stage headline/);
  });
});
