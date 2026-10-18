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
