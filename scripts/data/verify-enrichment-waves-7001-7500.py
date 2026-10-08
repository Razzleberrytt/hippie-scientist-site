#!/usr/bin/env python3
"""Native NCBI PubMed EFetch verification for THS research Waves 7001–7500.

This is a research-only source check. It never alters public content or creates
recommendations. Unresolved/mismatching sources fail closed and require review.
Uses only the Python standard library and public NCBI E-utilities.
"""
from __future__ import annotations
import json
import pathlib
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[2]
DIR = ROOT / "ops/enrichment-submissions/reconciliation"
PREFIX = "2026-10-07-enrichment-waves-7001-7500"
PREVIOUS = DIR / "2026-10-07-enrichment-waves-6501-7000-pmid-index.json"
BATCH_SIZE = 20
BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
HARD_REJECTION = re.compile(
    r"\b(?:retracted publication|retraction of|protocol for|study protocol|"
    r"bibliometric|scientometric|in vitro|in silico|murine|zebrafish|"
    r"mouse model|rat model|network pharmacology|preclinical practices|"\n    r"preclinical studies|humans and animals|human and animal|clinical and preclinical)\b", re.I
)

def read(name):
    return json.loads((DIR / name).read_text(encoding="utf-8"))

def write(name, content):
    file = DIR / name
    file.write_text(json.dumps(content, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

def clean_title(value):
    value = unicodedata.normalize("NFKD", value or "").lower()
    value = "".join(c for c in value if not unicodedata.combining(c))
    value = re.sub(r"\((\d+[a-z]*)\)", r"\1", value)
    return re.sub(r"[^a-z0-9]+", " ", value).strip()

def clean_doi(value):
    return re.sub(r"^(?:https?://(?:dx\.)?doi\.org/|doi:)", "", str(value or "").strip().lower())

def text(element):
    return " ".join("".join(element.itertext()).split()) if element is not None else ""

def fetch_batch(pmids):
    params = urllib.parse.urlencode({
        "db": "pubmed", "id": ",".join(pmids), "retmode": "xml",
        "tool": "THSResearchVerification"
    })
    url = BASE_URL + "?" + params
    last_error = None
    for attempt in range(5):
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": "THS-Research-Only-Verification/1.0"}
            )
            with urllib.request.urlopen(req, timeout=50) as response:
                payload = response.read()
            root = ET.fromstring(payload)
            records = {}
            for item in root.findall("./PubmedArticle"):
                citation = item.find("MedlineCitation")
                if citation is None:
                    continue
                pmid = text(citation.find("PMID"))
                article = citation.find("Article")
                if not pmid or article is None:
                    continue
                abstract_sections = []
                for node in article.findall("./Abstract/AbstractText"):
                    contents = text(node)
                    if contents:
                        label = node.get("Label") or node.get("NlmCategory")
                        abstract_sections.append(
                            (label + ": " if label and label not in ("UNASSIGNED",) else "") + contents
                        )
                types = [
                    text(node) for node in article.findall("./PublicationTypeList/PublicationType")
                ]
                doi = ""
                for node in item.findall("./PubmedData/ArticleIdList/ArticleId"):
                    if node.get("IdType", "").lower() == "doi":
                        doi = text(node)
                        break
                if not doi:
                    for node in article.findall("./ELocationID"):
                        if node.get("EIdType", "").lower() == "doi":
                            doi = text(node)
                            break
                records[pmid] = {
                    "title": text(article.find("ArticleTitle")),
                    "abstract": " ".join(abstract_sections).strip(),
                    "doi": doi,
                    "journal": text(article.find("./Journal/Title")),
                    "publication_types": types,
                    "pub_date": text(article.find("./Journal/JournalIssue/PubDate")),
                    "pmid": pmid,
                }
            return records
        except (urllib.error.URLError, TimeoutError, ET.ParseError) as error:
            last_error = str(error)
            if attempt < 4:
                time.sleep(min(2 ** attempt, 12))
    raise RuntimeError("PubMed EFetch repeatedly failed: " + str(last_error))

def main():
    predecessor = read(PREVIOUS.name)
    assert predecessor["through_wave"] == 7000
    assert len(predecessor["pmids"]) == 6935
    previous_pmids = set(map(str, predecessor["pmids"]))
    candidates = []
    for part in range(1, 6):
        doc = read(f"{PREFIX}-candidates-part-0{part}.json")
        assert doc["stage"] == "CANDIDATE_ONLY_UNVERIFIED"
        candidates.extend(doc["rows"])
    assert len(candidates) == 500
    assert all(int(row["wave"]) == 7001 + i for i, row in enumerate(candidates))
    candidate_pmids = [str(row["pmid"]) for row in candidates]
    assert len(set(candidate_pmids)) == 500
    assert not (set(candidate_pmids) & previous_pmids)

    source_records = {}
    retrieval_errors = []
    for start in range(0, len(candidate_pmids), BATCH_SIZE):
        chunk = candidate_pmids[start:start + BATCH_SIZE]
        try:
            source_records.update(fetch_batch(chunk))
            print(f"NCBI batch {start // BATCH_SIZE + 1:02}: retrieved "
                  f"{len(set(chunk) & set(source_records))}/{len(chunk)}", flush=True)
        except RuntimeError as exc:
            retrieval_errors.append({"pmids": chunk, "error": str(exc)})
        if start + BATCH_SIZE < len(candidate_pmids):
            time.sleep(0.55)

    verified = []
    failures = []
    seen_titles, seen_dois = set(), set()
    for candidate in candidates:
        wave, pmid = int(candidate["wave"]), str(candidate["pmid"])
        source = source_records.get(pmid)
        if source is None:
            failures.append({"wave": wave, "pmid": pmid, "reason": "PubMed record unavailable"})
            continue
        reasons = []
        source_title = clean_title(source["title"])
        if not source_title or source_title != clean_title(candidate["title"]):
            reasons.append("exact_title_mismatch")
        if len(source["abstract"]) < 70:
            reasons.append("missing_substantive_abstract")
        if HARD_REJECTION.search(source["title"]):
            reasons.append("source_title_semantic_exclusion")
        if any("retracted publication" in p.lower() for p in source["publication_types"]):
            reasons.append("retracted_publication")
        cdoi, sdoi = clean_doi(candidate.get("doi")), clean_doi(source["doi"])
        if cdoi and sdoi and cdoi != sdoi:
            reasons.append("source_doi_mismatch")
        if source_title in seen_titles or (sdoi and sdoi in seen_dois):
            reasons.append("duplicate_title_or_doi")
        if reasons:
            failures.append({
                "wave": wave, "pmid": pmid, "reason": ",".join(reasons),
                "candidate_title": candidate["title"], "pubmed_title": source["title"],
                "candidate_doi": candidate.get("doi"), "pubmed_doi": source["doi"],
            })
            continue
        seen_titles.add(source_title)
        if sdoi:
            seen_dois.add(sdoi)
        verified.append({
            **candidate,
            "title": source["title"], "verified_title": source["title"],
            "abstract": source["abstract"], "title_verified": True,
            "abstract_verified": True, "doi": sdoi or cdoi,
            "verified_journal": source["journal"],
            "verified_pub_date": source["pub_date"],
            "verified_publication_types": source["publication_types"],
            "source": "NCBI PubMed EFetch XML, direct public API",
            "state": "exact_source_verified_pending_semantic_final_review",
        })

    by_wave = {int(r["wave"]): r for r in verified}
    for part in range(5):
        first, last = 7001 + 100 * part, 7100 + 100 * part
        accepted = [by_wave[w] for w in range(first, last + 1) if w in by_wave]
        failed = [f for f in failures if first <= f["wave"] <= last]
        write(f"{PREFIX}-efetch-verified-part-0{part + 1}.json", {
            "schema_version": 1, "range": f"{first}-{last}",
            "state": "verified_pending_semantic_final_review",
            "exact_verified_rows": len(accepted), "unverified_rows": len(failed),
            "rows": accepted, "failures": failed,
        })
    summary = {
        "schema_version": 1, "batch_id": PREFIX, "stage": "efetch_source_verification",
        "status": "ready_for_semantic_reconciliation" if not failures else "partial_unverified_fail_closed",
        "candidate_rows": len(candidates), "verified_rows": len(verified),
        "unverified_rows": len(failures), "failure_details": failures,
        "retrieval_errors": retrieval_errors,
        "previous_pmids": 6935,
        "prospective_cumulative_pmids": 6935 + len(verified),
        "research_only": True, "recommendation_promotion": False,
        "dosing_inference": False, "public_content_published": False,
        "independent_semantic_review_still_required": True,
    }
    write(PREFIX + "-efetch-status.json", summary)
    print(json.dumps({
        "verified": len(verified), "unverified": len(failures),
        "retrieval_batches_failed": len(retrieval_errors),
        "failures_first_20": failures[:20],
    }, indent=2))
    # Fail closed at the data layer; the runner can still persist partial results
    # for review without declaring 500/500 final acceptance.

if __name__ == "__main__":
    main()
