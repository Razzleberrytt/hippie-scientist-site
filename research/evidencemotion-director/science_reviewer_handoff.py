#!/usr/bin/env python3
"""EM-007.07 source-locked independent-science review *intake*, never approval.

Prepare a portable packet from the already verified EM-007.08 HOLD receipt.
The packet contains no reviewer testimony, signature, external study review,
scientific acceptance, device verdict, or release authority.
"""
import argparse
import hashlib
from pathlib import Path

from science_gate_process_attestation import (
    GATE, canonical, hold, prepare_report_destination, read_record,
    strict_json, verify_attestation, write_report_atomically,
)

SCHEMA = "ths-em00707-qualified-review-intake-v1"
PACKET_DOMAIN = b"THS/EM00707/REVIEW_INTAKE_NOT_APPROVAL/v1\x00"
SOURCES = {
    "pubchem:3034396": "https://pubchem.ncbi.nlm.nih.gov/compound/3034396",
    "pubchem:44301524": "https://pubchem.ncbi.nlm.nih.gov/compound/44301524",
    "media:render": None,
    "media:story": None,
}
REVIEWER_QUESTIONS = (
    "Compare each frozen spoken claim and qualifier against the exact audio and encoded film.",
    "Independently verify source identity and distinguish computed structure from observed biological effects.",
    "Check whether the claim suggests plant quantity, receptor behavior, human benefit, or absence of effects not supported by these records.",
    "Document corrections or abstention with independently retrievable source citations and exact asset SHA.",
)
HUMAN_QUESTIONS = (
    "Independently search and appraise relevant human outcome literature, reporting population, outcome, dose, exposure duration and follow-up.",
    "Distinguish positive, null, conflicting and absent-from-this-source-pack results; do not infer that no studies exist.",
)


def reviewer_packet(gate):
    """Emit a completely unapproved, hash-bound review request."""
    verify_attestation(gate)
    if gate["scienceGate"] != GATE:
        hold("SOURCE_GATE_NOT_A_RESEARCH_HOLD")
    rows = []
    for claim in gate["claims"]:
        refs = []
        for ident in claim["sourceIds"]:
            if ident not in SOURCES:
                hold("UNKNOWN_PRIMARY_SOURCE_ID")
            refs.append({"id": ident, "primaryRecordUrl": SOURCES[ident]})
        questions = list(REVIEWER_QUESTIONS)
        if claim["material"]:
            questions.extend(HUMAN_QUESTIONS)
        rows.append({
            "claimId": claim["claimId"],
            "material": claim["material"],
            "originalSupportedMeaningScope": claim["sourceScope"],
            "exactSourceIdentifiers": refs,
            "unresolvedSourceGateHolds": list(claim["unresolvedHoldReasons"]),
            "requiredIndependentChecks": questions,
            "submittedReviewerFinding": None,
            "submittedEvidenceLinks": [],
            "claimApproved": False,
        })
    data = {
        "schema": SCHEMA, "task": "EM-007.07",
        "sourceScienceGateProcessDigest": gate["processAttestation"]["domainSeparatedDigest"],
        "exactFilmSha256": gate["filmSha256"],
        "exactOriginalWavSha256": gate["sourceWavSha256"],
        "exactClaimSourceJoinSha256": gate["sourceJoinSha256"],
        "eightClaimsToReview": rows,
        "reviewer": {
            "identity": None,
            "qualifications": None,
            "independenceDeclaration": None,
            "actualFilmAndAudioReviewed": False,
            "evidenceExternallyVerified": False,
            "receiptAuthenticated": False,
        },
        "externalHumanOutcomeSearchCompleted": False,
        "independentQualifiedReviewReceived": False,
        "independentScientificReviewPassed": False,
        "scientificGate": GATE,
        "machinePacketOnly": True,
        "mayPublish": False,
        "approvalToMerge": False,
    }
    data["processPacketDigest"] = hashlib.sha256(PACKET_DOMAIN + canonical(data)).hexdigest()
    return data


def verify_packet(packet, gate):
    """Reconstruct independently; even a rehashed forged reviewer cannot pass."""
    expected = reviewer_packet(gate)
    if packet != expected:
        hold("REVIEW_INTAKE_MUTATED_OR_FABRICATED_APPROVAL")
    return True


def main():
    parser = argparse.ArgumentParser(description="Build science review intake (HOLD only)")
    parser.add_argument("--gate", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    if Path(args.gate).resolve() == Path(args.out).resolve():
        hold("INPUT_OUTPUT_PATH_ALIAS_NOT_ALLOWED")
    out = prepare_report_destination(args.out)
    gate, _ = read_record(args.gate)
    packet = reviewer_packet(gate)
    verify_packet(packet, gate)
    write_report_atomically(out, packet)
    print("EM-007.07: review packet emitted; 8 claims, qualified review MISSING, mayPublish=false")


if __name__ == "__main__":
    main()
