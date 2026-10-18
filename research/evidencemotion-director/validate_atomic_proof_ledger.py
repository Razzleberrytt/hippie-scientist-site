#!/usr/bin/env python3
"""Fail-closed EvidenceMotion research-workcard counter reconciliation.

The inherited 707 are not individually audited. A passed machine-only
research proof cannot authorize human/creative/scientific/device acceptance
or publication. The 1,590 planning inventory remains on main.
"""
import json
import re
import hashlib
from pathlib import Path

SCHEMA="ths-atomic-workcard-proof-ledger-v1"
LEDGER=Path(__file__).with_name("ATOMIC-PROOF-LEDGER-20261015.json")
CARD=re.compile(r"^EM-\d{3}\.\d{2}\.[USOXTNR]$")
MAX_CARDS=1590

def hold(reason):
    raise ValueError("ATOMIC_PROOF_HOLD:"+reason)

def validate(data,source_directory):
    source_directory=Path(source_directory)
    if (not isinstance(data,dict) or data.get("schema")!=SCHEMA
        or data.get("denominator")!=MAX_CARDS
        or data.get("inheritedMappedToAcceptedFoundationsNotIndividuallyAudited")!=707
        or data.get("status")!="PROVISIONAL_COVERAGE_NOT_FINAL_ACCEPTANCE"
        or data.get("mayPublish") is not False
        or data.get("allCreativeScientificHumanHandsetAndMergeGatesPassed") is not False
        or data.get("individuallyVerifiedResearchCardsAreNotReleaseAcceptance") is not True
        or data.get("noDoubleCountAsserted") is not True):
        hold("DENOMINATOR_OR_ACCEPTANCE_CONTRACT_TAMPER")
    groups=data.get("proofGroups")
    # Existing 26 are mandatory; allow additional individually evidenced groups.
    if not isinstance(groups,list) or not 26<=len(groups)<=243:
        hold("EXACT_TWENTY_SIX_SOURCE_EVIDENCE_GROUPS_REQUIRED")
    sources={
        "EM-001.01":"EM00101-THREE-HOSTED-CPU-RUNS-20261016.md",
        "EM-001.02":"EM00102-CPU-ONLY-PLAYABLE-ARTIFACT-20261016.md",
        "EM-001.04":"EM00104-REQUIRED-CPU-NO-GPU-20261016.md",
        "EM-001.03":"EM00103-IPHONE-HANDOFF-BYTES-REVIEW-20261016.md",
        "EM-002.01":"EM00201-DATED-OWNER-POLICY-20261016.md",
        "EM-002.02":"EM00202-POLICY-CROSSWALK-20261016.md",
        "EM-002.04":"EM00204-POLICY-TRACKER-TRACE-20261016.md",
        "EM-002.03":"EM00203-RESEARCH-WORKFLOW-RELEASE-GUARD-20261016.md",
        "EM-034.04":"EM03404-ATOMIC-EVIDENCE-RECONCILIATION-20261015.md",
        "EM-034.11":"EM03411-ATOMIC-EVIDENCE-RECONCILIATION-20261015.md",
        "EM-023.01":"EM02301-ATOMIC-STORY-EVIDENCE-20261015.md",
        "EM-023.03":"EM02303-ATOMIC-VISUAL-REPAIR-20261015.md",
        "EM-034.12":"EM03412-ATOMIC-TIMED-SOUNDOFF-INSTRUMENT-20261016.md",
        "EM-006.04":"EM00604-BOTANICAL-CAPTION-NEGATIVE-20261016.md",
        "EM-008.05":"EM00805-ENCODED-BOTANICAL-NEGATIVES-20261016.md",
        "EM-008.03":"EM00803-ACTUAL-375PX-PIXEL-RESEARCH-20261016.md",
        "EM-008.04":"EM00804-ENCODED-375PX-OCR-RESEARCH-20261016.md",
        "EM-007.01":"EM00701-ATOMIC-SPOKEN-INVENTORY-20261016.md",
        "EM-014.01":"EM01401-ORIGINAL-PCM-TERM-ISOLATION-20261016.md",
        "EM-007.02":"EM00702-VISUAL-CLAIM-INVENTORY-20261016.md",
        "EM-007.03":"EM00703-PRIMARY-SOURCE-CONTEXT-20261016.md",
        "EM-007.04":"EM00704-FILM-SOURCE-UNCERTAINTY-20261016.md",
        "EM-007.06":"EM00706-SCIENCE-ADVERSARIAL-RECEIPT-20261016.md",
        "EM-007.05":"EM00705-REAL-ARCHIVE-SOURCE-STRENGTH-20261016.md",
        "EM-007.08":"EM00708-REAL-ARCHIVE-SCIENCE-HOLD-20261016.md",
        "EM-007.07":"EM00707-ONE-CLAIM-INDEPENDENT-SCIENCE-PREREQUISITES-20261017.md"
    }
    group_keys=set()
    cards=set()
    for record in groups:
        if not isinstance(record,dict):
            hold("INVALID_PROOF_GROUP")
        group,src=record.get("group"),record.get("source")
        if not isinstance(group,str) or not isinstance(src,str) or group in group_keys:
            hold("UNKNOWN_DUPLICATE_OR_MISBOUND_EVIDENCE_GROUP")
        if group not in sources:
            # Existing 707 provisional cards were allocated to accepted
            # foundations. Extra machine proof for one of those parents is
            # RECLASSIFICATION, not additive credit. Never inflate coverage.
            checklist=source_directory/"COMPLETION-CHECKLIST.md"
            if not checklist.is_file():
                hold("CANONICAL_46_PARENT_CHECKLIST_REQUIRED")
            states=[line[:5] for line in checklist.read_text(encoding="utf-8").splitlines()
                    if line.startswith("- [x] ") or line.startswith("- [ ] ")]
            if len(states)!=46:
                hold("CANONICAL_46_PARENT_CHECKLIST_INCONSISTENT")
            try:
                parent=int(group.split(".",1)[0].split("-",1)[1])
            except (ValueError,IndexError):
                hold("UNKNOWN_CANONICAL_PARENT")
            if parent<1 or parent>46:
                hold("UNKNOWN_CANONICAL_PARENT")
            if states[parent-1]=="- [x]":
                hold("ACCEPTED_PARENT_REQUIRES_INHERITED_RECLASSIFICATION")
        if group in sources:
            if src!=sources[group]:
                hold("UNKNOWN_DUPLICATE_OR_MISBOUND_EVIDENCE_GROUP")
        else:
            # Expansion requires a canonical task, a unique named evidence
            # file, exact-byte SHA and observed first-party run/merge identity.
            if not re.fullmatch(r"EM-\d{3}\.\d{2}",group):
                hold("UNKNOWN_DUPLICATE_OR_MISBOUND_EVIDENCE_GROUP")
            key=group.replace("-","").replace(".","")
            if (not re.fullmatch(r"EM\d{5}-[A-Z0-9-]+-20\d{6}\.md",src)
                or not src.startswith(key+"-")):
                hold("UNPINNED_NEW_EVIDENCE_SOURCE")
        group_keys.add(group)
        p=source_directory/src
        if not p.is_file() or p.is_symlink():
            hold("MISSING_PRIMARY_PROOF_RECEIPT:"+str(src))
        proof_bytes=p.read_bytes()
        proof=proof_bytes.decode("utf-8")
        if group not in sources:
            digest=record.get("sourceSha256")
            if (not isinstance(digest,str) or
                not re.fullmatch(r"[0-9a-f]{64}",digest) or
                hashlib.sha256(proof_bytes).hexdigest()!=digest):
                hold("NEW_EVIDENCE_SOURCE_SHA_UNVERIFIED")
            merge=record.get("mergeCommitSha")
            run=record.get("workflowRunId")
            if (not isinstance(merge,str) or
                not re.fullmatch(r"[0-9a-f]{40}",merge) or
                type(run) is not int or run<=0 or
                "https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/"+str(run) not in proof or
                merge not in proof or "mayPublish=false" not in proof):
                hold("NEW_EVIDENCE_MERGE_RUN_OR_HOLD_NOT_DOCUMENTED")
        ids=record.get("cards")
        if not isinstance(ids,list) or not ids:
            hold("NO_ACTUAL_EVIDENCE_CARD_IDS")
        # EM00707 has ONLY machine-verifiable pre-review U/S/O; never count
        # independent reviewer execution, outcome, negatives or signoff as passed.
        if group == "EM-007.07" and (ids != ["EM-007.07.U", "EM-007.07.S", "EM-007.07.O"]):
            hold("EM00707_INDEPENDENT_REVIEW_NOT_RECEIVED_NO_X_T_N_R_CREDIT")
        for card in ids:
            if not isinstance(card,str) or not CARD.fullmatch(card):
                hold("INVALID_ATOMIC_CARD_ID")
            if card in cards:
                hold("DUPLICATED_CARD_CLAIM:"+card)
            permitted=("EM-034.04.","EM-034.02.") if group=="EM-034.04" else (group+".",)
            if not card.startswith(permitted):
                hold("WRONG_PROOF_GROUP_FOR_CARD:"+card)
            if group not in sources:
                # Only canonical pre-existing workcards may earn new credit.
                # Reject missing or empty plan inventory instead of trusting
                # merely well-formed IDs or newly invented markdown proofs.
                plan_dir=source_directory/"atomic"
                plan_files=sorted(plan_dir.glob("0[1-5]-*.md"))
                if len(plan_files)!=5:
                    hold("CANONICAL_ATOMIC_INVENTORY_REQUIRED")
                canonical="\n".join(f.read_text(encoding="utf-8") for f in plan_files)
                if ("**"+card+"**") not in canonical:
                    hold("NEW_CARD_NOT_IN_CANONICAL_1590_TEMPLATES:"+card)
            good=any(line.strip().startswith("|") and
                     (chr(96)+card+chr(96)) in line and
                     "VERIFIED_MACHINE_RESEARCH" in line
                     for line in proof.splitlines())
            if not good:
                hold("NO_EXPLICIT_RESEARCH_PROOF_TABLE_ROW:"+card)
            cards.add(card)
    if not set(sources).issubset(group_keys):
        hold("REQUIRED_PROOF_SET_NOT_EXHAUSTIVE")
    verified=len(cards)
    raw_coverage=707+verified
    coverage=data.get("provisionalCoverageCardCount")
    if type(coverage) is not int or not 0<=coverage<=MAX_CARDS:
        hold("RESEARCH_CARD_ARITHMETIC_OR_ROLLUP_WRONG")
    if coverage!=raw_coverage:
        # A future corrected headline may *deduplicate* the legitimate
        # overlap between independently machine-audited stages and 707
        # inherited provisional stages. Never accept an arbitrary lower
        # numerator: reconstruct all frozen stage IDs and the 46-parent
        # acceptance mask from the physical canonical files.
        plan_dir=source_directory/"atomic"
        files=sorted(plan_dir.glob("0[1-5]-*.md"))
        if len(files)!=5:
            hold("DEDUPLICATED_CANONICAL_INVENTORY_REQUIRED")
        canonical=[]
        for file in files:
            canonical.extend(re.findall(
                r"^- \[([ x])\] \*\*(EM-\d{3}\.\d{2}\.[USOXTNR])\*\*",
                file.read_text(encoding="utf-8"),re.M))
        ids=[item[1] for item in canonical]
        if len(ids)!=MAX_CARDS or len(set(ids))!=MAX_CARDS:
            hold("DEDUPLICATED_CANONICAL_INVENTORY_INVALID")
        checklist=source_directory/"COMPLETION-CHECKLIST.md"
        if not checklist.is_file():
            hold("DEDUPLICATED_PARENT_CHECKLIST_REQUIRED")
        accepted=[match=="x" for match in re.findall(
            r"^- \[([x ])\] ",checklist.read_text(encoding="utf-8"),re.M)]
        if len(accepted)!=46:
            hold("DEDUPLICATED_PARENT_CHECKLIST_INVALID")
        inherited={card for card in ids if accepted[int(card[3:6])-1]}
        distinct=len(inherited|(cards&set(ids)))
        if len(inherited)!=707 or coverage!=distinct:
            hold("RESEARCH_CARD_ARITHMETIC_OR_ROLLUP_WRONG")
    if (verified!=data.get("individualMachineVerifiedResearchCardCount")
        or abs(round(100*coverage/MAX_CARDS,4)-
               data.get("provisionalCoveragePercent",float("inf")))>0.0001):
        hold("RESEARCH_CARD_ARITHMETIC_OR_ROLLUP_WRONG")
    return {
        "schema":SCHEMA,"evidenceGroupCount":len(group_keys),
        "individuallyAuditedMachineResearchOnly":verified,
        "inheritedProvisionalCoverageNotIndividuallyAudited":707,
        "provisionalCoverage":coverage,
        "totalAtomicTemplates":MAX_CARDS,
        "provisionalCoveragePercent":round(100*coverage/MAX_CARDS,4),
        "individualResearchCardIDs":sorted(cards),
        "finalCreativeScientificViewerOrDeviceApproved":False,
        "mayPublish":False,
    }

def main():
    data=json.loads(LEDGER.read_text(encoding="utf-8"))
    print(json.dumps(validate(data,LEDGER.parent),indent=2))

if __name__=="__main__":
    main()
