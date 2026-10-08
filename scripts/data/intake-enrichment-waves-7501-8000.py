#!/usr/bin/env python3
"""NCBI-native, research-only 500-source enrichment intake for Waves 7501-8000.

Source of truth is NCBI PubMed ESearch + EFetch, never model-generated citations.
The emitted source receipts are candidates for semantic review, NOT clinical evidence
admission, site copy, dosing advice, or treatment recommendations.
"""
from __future__ import annotations
import hashlib
import http.client
import json
import pathlib
import re
import time
import unicodedata
import urllib.parse
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[2]
DIR = ROOT / "ops/enrichment-submissions/reconciliation"
PREFIX = "2026-10-08-enrichment-waves-7501-8000"
PRIOR_NAME = "2026-10-07-enrichment-waves-7001-7500-pmid-index.json"
NEGATIVE_NAME = "2026-10-07-enrichment-waves-7001-7500-negative-pmid-index.json"
BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
BASE_FILTER = ('hasabstract[text] AND Humans[MeSH Terms] '
               'AND ("Randomized Controlled Trial"[Publication Type] '
               'OR "Clinical Trial"[Publication Type] '
               'OR "Controlled Clinical Trial"[Publication Type] '
               'OR "Meta-Analysis"[Publication Type] '
               'OR "Systematic Review"[Publication Type] '
               'OR "Observational Study"[Publication Type]) '
               'AND 2010:2026[Publication Date] '
               'NOT "Retracted Publication"[Publication Type] '
               'NOT "Case Reports"[Publication Type]')
TOPICS = [
  ("stress_anxiety",40,'(ashwagandha OR "Withania somnifera" OR "Melissa officinalis" OR "lemon balm" OR lavender OR saffron OR passiflora OR theanine) AND (anxiety OR stress)'),
  ("sleep",40,'(magnesium OR melatonin OR valerian OR glycine OR chamomile OR lavender OR ashwagandha) AND (insomnia OR sleep)'),
  ("withdrawal_nps",25,'(kratom OR mitragynine OR kava OR cannabidiol OR cannabis OR opioid OR benzodiazepine) AND (withdrawal OR dependence OR addiction OR safety)'),
  ("cardiometabolic",35,'("omega-3" OR fish oil OR phytosterols OR berberine OR fiber OR magnesium OR flavonoids) AND (blood pressure OR cholesterol OR cardiovascular)'),
  ("performance",20,'(creatine OR caffeine OR beta-alanine OR citrulline OR protein OR beetroot) AND (exercise OR performance OR strength)'),
  ("aging_sarcopenia",20,'(protein OR creatine OR leucine OR vitamin D OR omega-3) AND (sarcopenia OR frailty OR older adults OR muscle aging)'),
  ("women_health",20,'(iron OR vitamin D OR magnesium OR omega-3 OR probiotics OR inositol) AND (menopause OR polycystic ovary OR dysmenorrhea OR pregnancy)'),
  ("micronutrients",35,'(vitamin D OR vitamin B12 OR folate OR zinc OR selenium OR iron OR magnesium) AND (supplementation OR deficiency)'),
  ("gut",30,'(prebiotic OR probiotic OR synbiotic OR fiber OR microbiome) AND (irritable bowel OR gut OR constipation OR microbiota)'),
  ("cognition_focus",30,'(omega-3 OR caffeine OR creatine OR theanine OR bacopa OR ginkgo OR citicoline) AND (cognition OR attention OR memory OR executive function)'),
  ("mood",25,'(saffron OR vitamin D OR omega-3 OR magnesium OR probiotic OR St Johns wort) AND (depression OR mood OR depressive)'),
  ("inflammation_pain",30,'(curcumin OR turmeric OR boswellia OR ginger OR omega-3 OR glucosamine) AND (pain OR inflammation OR arthritis)'),
  ("metabolic",25,'(berberine OR psyllium OR cinnamon OR inositol OR chromium OR omega-3) AND (glucose OR diabetes OR insulin OR metabolic syndrome)'),
  ("botanicals_mushrooms",30,'(ashwagandha OR rhodiola OR bacopa OR ginseng OR garlic OR "lion mane" OR echinacea) AND (clinical trial OR randomized OR efficacy OR safety)'),
  ("safety_interactions",30,'("herbal supplement" OR "dietary supplement" OR "botanical" OR "St Johns wort") AND (adverse event OR interactions OR toxicity OR safety)'),
  ("cannabinoid_safety",25,'(cannabis OR cannabinoid OR cannabidiol OR THC) AND (psychosis OR cognition OR driving OR adverse OR dependence)'),
  ("mitochondrial_energy",20,'(coenzyme Q10 OR ubiquinol OR carnitine OR nicotinamide riboside OR creatine) AND (fatigue OR mitochondrial OR energy)'),
  ("immune_respiratory",20,'(vitamin C OR vitamin D OR zinc OR elderberry OR echinacea OR probiotic) AND (respiratory OR influenza OR common cold OR infection)'),
]
assert sum(q for _,q,_ in TOPICS) == 500
HARD_TITLE = re.compile(
  r"\b(?:retracted publication|retraction of|protocol for|study protocol|"
  r"bibliometric|scientometric|in vitro|in silico|murine|zebrafish|"
  r"mouse model|rat model|network pharmacology|preclinical practices|"
  r"preclinical studies|humans and animals|human and animal|"
  r"clinical and preclinical|preclinical and clinical|animal models|animal studies|anxiolytic-like|studies in animals|animal experiments?|in mice|mice and|in animals|animal and human|animals and human)\b", re.I
)
GOOD_TYPE = ("randomized controlled trial","controlled clinical trial","clinical trial",
             "meta-analysis","systematic review","observational study")
UA = {"User-Agent": "THSHumanResearchEnrichment/1.0 (source-verification; no commercial use)"}

# Independent clinical evidence assessment remains required; this narrower title
# gate rejects obvious semantic drift caused by broad abstract/MeSH ESearch matches.
DOMAIN_TITLE = {
  "stress_anxiety":r"\b(?:anxiety|anxious|anxiolytic|stress|stress-related)\b",
  "sleep":r"\b(?:sleep|insomnia|circadian|sleepiness)\b",
  "withdrawal_nps":r"\b(?:withdrawal|dependen(?:ce|cy|t)|addiction|addictive|abuse|misuse|opioid use disorder|substance use disorder|kratom|mitragynine|benzodiazepine)\b",
  "cardiometabolic":r"\b(?:cardio\w*|cholesterol|hypertension|blood pressure|blood lipid\w*|lipid profile|triglyceride\w*|vascular|atherosclerosis|arterial|endothelial|blood flow|phytosterol\w*|plant sterol\w*)\b",
  "performance":r"\b(?:exercis\w*|muscle|athlet\w*|strength|perform\w*|training|sprint\w*|endurance|recovery|ergogenic)\b",
  "aging_sarcopenia":r"\b(?:old(?:er)? adult\w*|elder\w*|ageing|aging|sarcopen\w*|frailt\w*|muscle mass|muscle strength|muscle function|physical function)\b",
  "women_health":r"\b(?:women|female\w*|menopaus\w*|pregnan\w*|ovarian|ovary|polycystic|dysmenorrhea|endometriosis|pcos|menstrual|postpartum|lactation|breastfed)\b",
  "micronutrients":r"\b(?:vitamin\w*|zinc|selenium|iron|folate|folic|magnesium|micronutrient\w*|b12|b6|riboflavin|thiamin|niacin|calcium|trace element\w*)\b",
  "gut":r"\b(?:gut|microbiome|microbiota|intestinal|bowel|probiotic\w*|prebiotic\w*|constipation|fiber|fibre|synbiotic\w*|ibs|digestive)\b",
  "cognition_focus":r"\b(?:cogniti\w*|brain|memory|attention|executive|focus|neurocogniti\w*|dementia|mental perform\w*|learning)\b",
  "mood":r"\b(?:depress\w*|mood|affectiv\w*|anhedoni\w*|mental health|psychiatric)\b",
  "inflammation_pain":r"\b(?:inflamm\w*|pain|arthrit\w*|analges\w*|soreness|arthralgia|osteoarthritis|muscle damage)\b",
  "metabolic":r"\b(?:glucos\w*|diabet\w*|insulin|metaboli\w*|glycem\w*|hba1c|blood sugar|body weight|obesity)\b",
  "botanicals_mushrooms":r"\b(?:ashwagandha|withania|rhodiola|bacopa|ginseng|garlic|lion.s mane|echinacea|salidroside|ginsenoside|herbal|botanical|phytotherap\w*|adaptogen\w*|saffron|crocus sativus)\b",
  "safety_interactions":r"\b(?:supplement\w*|herbal|botanical|herb.drug|phytochem\w*|nutraceut\w*|hepatotoxic\w*|kratom|kava|cannabidiol|st john.s wort)\b",
  "cannabinoid_safety":r"\b(?:cannabi\w*|marijuana|tetrahydrocannabinol|THC|CBD|dronabinol|nabilone|sativex)\b",
  "mitochondrial_energy":r"\b(?:mitochondri\w*|coenzyme q10|coq10|ubiquinol|ubiquinone|carnitine|nicotinamide riboside|creatine|fatigue|atp)\b",
  "immune_respiratory":r"\b(?:respiratory|immune|immunity|influenza|common cold|viral infection|covid|pneumonia|infection\w*)\b"
}
SECOND_REQUIRED = {
  "sleep": r"\b(?:supplement\w*|melatonin|magnesium|valerian|glycine|chamomile|lavender|ashwagandha|herbal|botanical|nutrient\w*|tryptophan|vitamin)\b",
  "aging_sarcopenia":r"\b(?:protein|creatine|leucine|vitamin|omega.3|supplement\w*|nutrient\w*|nutrition\w*|intervention\w*|exercise|training|resistance)\b",
  "withdrawal_nps":r"\b(?:opioid\w*|opiat\w*|heroin|cannabi\w*|marijuana|benzodiazepine\w*|kratom|mitragynine|kava|substance|drug use)\b",
  "safety_interactions":r"\b(?:safet\w*|risk\w*|adverse|toxicit\w*|interaction\w*|side effect\w*|overdos\w*|hepatotoxic\w*|poison\w*|harm\w*|contaminat\w*|contraindic\w*|pharmacokinetic\w*)\b",
  "cannabinoid_safety":r"\b(?:risk\w*|safet\w*|harm\w*|adverse|toxicit\w*|psychos\w*|cogniti\w*|memory|withdrawal|dependen\w*|driving|psychiatric|misuse|addict\w*|interaction\w*|impairment)\b",
  "immune_respiratory":r"\b(?:supplement\w*|vitamin\w*|zinc|elderberry|echinacea|probiotic\w*|nutrient\w*|nutrition\w*|ascorbic acid)\b"
}
def title_in_scope(category,title):
    if not re.search(DOMAIN_TITLE[category],title,re.I):
        return False
    return category not in SECOND_REQUIRED or bool(re.search(SECOND_REQUIRED[category],title,re.I))


def read(name):
    return json.loads((DIR / name).read_text(encoding="utf-8"))

def write(name, value):
    path = DIR / name
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path

def req(endpoint, params):
    url = BASE + endpoint + "?" + urllib.parse.urlencode(params)
    last = None
    for attempt in range(7):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=70) as f:
                out = f.read()
            time.sleep(0.40)
            return ET.fromstring(out)
        except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError,ET.ParseError,http.client.HTTPException,OSError) as exc:
            last = exc
            time.sleep(min(2**attempt, 25))
    raise RuntimeError(f"NCBI request repeatedly failed ({endpoint}): {last}")

def norm_title(v):
    v = unicodedata.normalize("NFKD",str(v or "").lower())
    return re.sub(r"[^a-z0-9]+"," ","".join(c for c in v if not unicodedata.combining(c))).strip()

def norm_doi(v):
    return re.sub(r"^(?:https?://(?:dx\.)?doi\.org/|doi:)","",str(v or "").strip().lower())

def node_text(node):
    return " ".join("".join(node.itertext()).split()) if node is not None else ""

def esearch(query):
    root = req("esearch.fcgi",{"db":"pubmed","term":f"({query}) AND ({BASE_FILTER})",
                               "retmax":"1200","retmode":"xml","sort":"relevance","tool":"THSResearch"})
    return [n.text.strip() for n in root.findall("./IdList/Id") if n.text and n.text.strip().isdigit()]

def efetch(ids):
    root = req("efetch.fcgi",{"db":"pubmed","id":",".join(ids),"retmode":"xml","tool":"THSResearch"})
    ret = {}
    for item in root.findall("./PubmedArticle"):
        citation = item.find("MedlineCitation")
        article = citation.find("./Article") if citation is not None else None
        if article is None: continue
        pmid = node_text(citation.find("PMID"))
        title = node_text(article.find("ArticleTitle"))
        abstract = []
        for n in article.findall("./Abstract/AbstractText"):
            v = node_text(n)
            if v: abstract.append(((n.get("Label") or "") + ": " if n.get("Label") else "") + v)
        types = [node_text(t) for t in article.findall("./PublicationTypeList/PublicationType")]
        doi = ""
        for n in item.findall("./PubmedData/ArticleIdList/ArticleId"):
            if (n.get("IdType") or "").lower() == "doi":
                doi = node_text(n)
                break
        if not doi:
            for n in article.findall("./ELocationID"):
                if (n.get("EIdType") or "").lower() == "doi":
                    doi = node_text(n)
                    break
        ret[pmid] = {"pmid":pmid,"title":title,
                     "abstract":" ".join(abstract).strip(),"doi":norm_doi(doi),
                     "journal":node_text(article.find("./Journal/Title")),
                     "pub_date":node_text(article.find("./Journal/JournalIssue/PubDate")),
                     "publication_types":types}
    return ret

def valid(rec, previous, rejected, category):
    if rec["pmid"] in previous or rec["pmid"] in rejected: return "prior_or_rejected_pmid"
    if len(rec["abstract"]) < 160 or len(rec["title"]) < 18: return "missing_substantive_abstract_or_title"
    if HARD_TITLE.search(rec["title"]): return "off_domain_title"
    if not title_in_scope(category,rec["title"]): return "semantic_title_out_of_scope"
    types = {x.lower() for x in rec["publication_types"]}
    if "retracted publication" in types: return "retracted"
    if not any(any(kind in t for kind in GOOD_TYPE) for t in types): return "not_target_human_study_type"
    if any(t in types for t in ("published erratum","retraction of publication")): return "correction_or_retraction"
    return ""

def main():
    prior = read(PRIOR_NAME)
    assert prior["through_wave"] == 7500 and prior["total_unique_pmids"] == 7435
    assert len(prior["pmids"]) == len(set(map(str,prior["pmids"]))) == 7435
    prev = set(map(str,prior["pmids"]))
    neg = read(NEGATIVE_NAME)
    rejected = set(map(str,neg["rejected_pmids"]))
    selected = []
    reserve = []
    seen_pmids, seen_titles, seen_dois = set(),set(),set()
    stats, failures = [], []
    for category, quota, search in TOPICS:
        ids = esearch(search)
        assigned = 0
        fetched = 0
        for i in range(0, len(ids), 40):
            if assigned >= quota and len(reserve) >= 150: break
            candidate_ids = [v for v in ids[i:i+40] if v not in prev and v not in rejected
                             and v not in seen_pmids]
            if not candidate_ids: continue
            records = efetch(candidate_ids)
            fetched += len(records)
            for pmid in candidate_ids:
                rec = records.get(pmid)
                if not rec:
                    failures.append({"pmid":pmid,"category":category,"reason":"missing_efetch_record"})
                    continue
                why = valid(rec,prev,rejected,category)
                title, doi = norm_title(rec["title"]),norm_doi(rec["doi"])
                if not why and (pmid in seen_pmids or title in seen_titles or (doi and doi in seen_dois)):
                    why = "duplicate_identity"
                if why:
                    failures.append({"pmid":pmid,"category":category,"reason":why})
                    continue
                seen_pmids.add(pmid);seen_titles.add(title)
                if doi: seen_dois.add(doi)
                rec.update({"category":category,"discovery_query":search,
                            "source":"NCBI PubMed ESearch + direct EFetch XML",
                            "title_verified":True,"verified_title":rec["title"],
                            "abstract_verified":True,
                            "state":"exact_source_verified_pending_independent_semantic_review",
                            "research_only":True})
                if assigned < quota:
                    selected.append(rec)
                    assigned += 1
                else:
                    reserve.append(rec)
            if assigned >= quota and len(reserve) >= 150: break
        stats.append({"category":category,"target":quota,"selected":assigned,
                      "esearch_ids":len(ids),"fetched":fetched})
        print(f"{category}: {assigned}/{quota}, searched={len(ids)}, efetched={fetched}",flush=True)
    needed = 500 - len(selected)
    if needed:
        selected.extend(reserve[:needed])
    if len(selected) != 500:
        write(PREFIX+"-incomplete-audit.json",
              {"state":"INCOMPLETE_FAIL_CLOSED","selected":len(selected),"target":500,
               "category_stats":stats,"rejections":Counter(x["reason"] for x in failures)})
        raise SystemExit(f"Fail closed: only {len(selected)}/500 distinct verified candidates")
    for i, r in enumerate(selected):
        r["wave"] = 7501+i
    ids = [r["pmid"] for r in selected]
    assert len(ids) == len(set(ids)) == 500
    assert not (set(ids) & prev) and not (set(ids) & rejected)
    assert len(set(norm_title(r["title"]) for r in selected)) == 500
    dois = [norm_doi(r["doi"]) for r in selected if r["doi"]]
    assert len(dois) == len(set(dois))
    parts = []
    for i in range(5):
        rows = selected[i*100:(i+1)*100]
        name = f"{PREFIX}-source-verified-part-{i+1:02d}.json"
        f = write(name,{"schema_version":1,"range":f"{7501+i*100}-{7600+i*100}",
                        "state":"pending_independent_semantic_review",
                        "exact_verified_rows":100,"failures":[],"rows":rows})
        b=f.read_bytes()
        sha=hashlib.sha1(b"blob "+str(len(b)).encode()+b"\x00"+b).hexdigest()
        parts.append({"path":f"ops/enrichment-submissions/reconciliation/{name}",
                      "blob_sha":sha,"rows":100})
    merged = sorted(prev.union(ids),key=int)
    write(PREFIX+"-pmid-index.json",
          {"schema_version":1,"through_wave":8000,"previous_unique_pmids":7435,
           "new_unique_pmids":500,"total_unique_pmids":7935,"pmids":merged})
    write(PREFIX+"-final-audit.json",
          {"schema_version":1,"range":"7501-8000","row_count":500,
           "unique_pmids":500,"exact_title_verified":500,"substantive_abstracts_verified":500,
           "prior_pmid_collisions":0,"duplicate_pmids":0,"duplicate_titles":0,
           "duplicate_dois":0,"missing_dois":500-len(dois),
           "category_counts":dict(Counter(r["category"] for r in selected)),
           "discovery_stats":stats,"rejected_candidates":len(failures),
           "rejection_reasons":dict(Counter(r["reason"] for r in failures)),
           "semantic_review_complete":False,"research_only":True})
    write(PREFIX+"-final-manifest.json",
          {"schema_version":1,"batch_id":PREFIX,"range":"7501-8000",
           "state":"source_verified_pending_independent_semantic_and_repository_review",
           "research_only":True,"fail_closed":True,"previous_unique_pmids":7435,
           "accepted_new_unique_pmids":0,"source_verified_candidates":500,
           "prospective_cumulative_unique_pmids":7935,
           "admission_policy":{"published_entities":False,"runtime_admission":False,
             "recommendations":False,"dosing_claims":False,
             "clinical_claims_require_separate_review":True},
           "artifact_parts":parts,"audit":PREFIX+"-final-audit.json",
           "provisional_cumulative_index":PREFIX+"-pmid-index.json",
           "predecessor_index":PRIOR_NAME,"negative_index":NEGATIVE_NAME})
    write(PREFIX+"-status.json",
          {"state":"500_exact_source_verified_PENDING_SEMANTIC_REVIEW",
           "verified_rows":500,"merged":False,"published":False,
           "research_only":True,"prior_unique_pmids":7435,
           "prospective_cumulative_pmids":7935,
           "warning":"Automated title/abstract checks do not establish clinical relevance or final evidence admission."})
    print(json.dumps({"source_verified":500,"prior":7435,"prospective":7935,
                      "rejections":len(failures),"semantic_review":"PENDING",
                      "published":False},indent=2),flush=True)

if __name__ == "__main__":
    main()
