#!/usr/bin/env python3
"""Fail-closed EvidenceMotion research-workcard counter reconciliation.

The inherited 707 are not individually audited. A passed machine-only
research proof cannot authorize human/creative/scientific/device acceptance
or publication. The 1,590 planning inventory remains on main.
"""
import json
import re
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
    if not isinstance(groups,list) or len(groups)!=14:
        hold("EXACT_FOURTEEN_SOURCE_EVIDENCE_GROUPS_REQUIRED")
    sources={
        "EM-001.01":"EM00101-THREE-HOSTED-CPU-RUNS-20261016.md",
        "EM-034.04":"EM03404-ATOMIC-EVIDENCE-RECONCILIATION-20261015.md",
        "EM-034.11":"EM03411-ATOMIC-EVIDENCE-RECONCILIATION-20261015.md",
        "EM-023.01":"EM02301-ATOMIC-STORY-EVIDENCE-20261015.md",
        "EM-023.03":"EM02303-ATOMIC-VISUAL-REPAIR-20261015.md",
        "EM-034.12":"EM03412-ATOMIC-TIMED-SOUNDOFF-INSTRUMENT-20261016.md",
        "EM-007.01":"EM00701-ATOMIC-SPOKEN-INVENTORY-20261016.md",
        "EM-014.01":"EM01401-ORIGINAL-PCM-TERM-ISOLATION-20261016.md",
        "EM-007.02":"EM00702-VISUAL-CLAIM-INVENTORY-20261016.md",
        "EM-007.03":"EM00703-PRIMARY-SOURCE-CONTEXT-20261016.md",
        "EM-007.04":"EM00704-FILM-SOURCE-UNCERTAINTY-20261016.md",
        "EM-007.06":"EM00706-SCIENCE-ADVERSARIAL-RECEIPT-20261016.md",
        "EM-007.05":"EM00705-REAL-ARCHIVE-SOURCE-STRENGTH-20261016.md",
        "EM-007.08":"EM00708-REAL-ARCHIVE-SCIENCE-HOLD-20261016.md"
    }
    group_keys=set()
    cards=set()
    for record in groups:
        if not isinstance(record,dict):
            hold("INVALID_PROOF_GROUP")
        group,src=record.get("group"),record.get("source")
        if group not in sources or src!=sources[group] or group in group_keys:
            hold("UNKNOWN_DUPLICATE_OR_MISBOUND_EVIDENCE_GROUP")
        group_keys.add(group)
        p=source_directory/src
        if not p.is_file() or p.is_symlink():
            hold("MISSING_PRIMARY_PROOF_RECEIPT:"+str(src))
        proof=p.read_text(encoding="utf-8")
        ids=record.get("cards")
        if not isinstance(ids,list) or not ids:
            hold("NO_ACTUAL_EVIDENCE_CARD_IDS")
        for card in ids:
            if not isinstance(card,str) or not CARD.fullmatch(card):
                hold("INVALID_ATOMIC_CARD_ID")
            if card in cards:
                hold("DUPLICATED_CARD_CLAIM:"+card)
            permitted=("EM-034.04.","EM-034.02.") if group=="EM-034.04" else (group+".",)
            if not card.startswith(permitted):
                hold("WRONG_PROOF_GROUP_FOR_CARD:"+card)
            good=any(line.strip().startswith("|") and
                     (chr(96)+card+chr(96)) in line and
                     "VERIFIED_MACHINE_RESEARCH" in line
                     for line in proof.splitlines())
            if not good:
                hold("NO_EXPLICIT_RESEARCH_PROOF_TABLE_ROW:"+card)
            cards.add(card)
    if group_keys!=set(sources):
        hold("REQUIRED_PROOF_SET_NOT_EXHAUSTIVE")
    verified=len(cards)
    coverage=707+verified
    if (verified!=data.get("individualMachineVerifiedResearchCardCount")
        or coverage!=data.get("provisionalCoverageCardCount")
        or coverage>MAX_CARDS
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
