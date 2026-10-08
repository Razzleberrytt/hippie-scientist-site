#!/usr/bin/env python3
"""Lane 4: source-verified PubMed intake, research-only, no clinical promotion."""
import hashlib, json, pathlib, re, subprocess, time, unicodedata
import urllib.parse, urllib.request, xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/"ops/enrichment-submissions/reconciliation/2026-10-08-lane4-opioid-nps-25.json"
MANIFEST=ROOT/"ops/enrichment-submissions/reconciliation/2026-10-08-lane4-opioid-nps-25-manifest.json"
INDEX="ops/enrichment-submissions/reconciliation/2026-10-07-enrichment-waves-7001-7500-pmid-index.json"
DRAFT="ops/enrichment-submissions/reconciliation/2026-10-08-enrichment-waves-7501-8000-pmid-index.json"
BRANCH="research/enrichment-waves-7501-8000-20261008"
BASE="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
UA={"User-Agent":"THS-Lane4-NCBI-Research/1.0 (noncommercial source validation)"}
TOPICS=[
 ("opioid_overdose",7,'(fentanyl OR nitazene OR "synthetic opioid") AND (overdose OR mortality OR naloxone)'),
 ("opioid_withdrawal_recovery",7,'(buprenorphine OR methadone OR "opioid use disorder") AND (withdrawal OR retention OR recovery OR relapse)'),
 ("kratom_nps",6,'(kratom OR mitragynine OR "7-hydroxymitragynine" OR tianeptine) AND (dependence OR withdrawal OR toxicology OR poisoning OR adverse)'),
 ("harm_reduction",5,'(naloxone OR "drug checking" OR "fentanyl test strips" OR "overdose prevention") AND (overdose OR harm reduction OR mortality)')
]
def norm_title(v):
 v=unicodedata.normalize("NFKD",str(v or "").lower())
 return re.sub(r"[^a-z0-9]+"," ","".join(c for c in v if not unicodedata.combining(c))).strip()
def norm_doi(v): return re.sub(r"^(https?://(dx\.)?doi\.org/|doi:)","",str(v or "").strip().lower())
def text(n): return " ".join("".join(n.itertext()).split()) if n is not None else ""
def get(endpoint,params):
 url=BASE+endpoint+"?"+urllib.parse.urlencode(params)
 for i in range(6):
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=55) as f: b=f.read()
   time.sleep(.38);return ET.fromstring(b)
  except Exception:
   if i==5: raise
   time.sleep(min(2**i,16))
def existing():
 prior=json.loads((ROOT/INDEX).read_text())
 assert prior["total_unique_pmids"]==7435
 subprocess.run(["git","fetch","--no-tags","origin",BRANCH],cwd=ROOT,check=True,stdout=subprocess.PIPE)
 head=subprocess.check_output(["git","rev-parse","FETCH_HEAD"],cwd=ROOT,text=True).strip()
 draft=json.loads(subprocess.check_output(["git","show","FETCH_HEAD:"+DRAFT],cwd=ROOT,text=True))
 assert draft["total_unique_pmids"]==7935
 pmids=set(map(str,prior["pmids"]))|set(map(str,draft["pmids"]))
 dois=set();titles=set()
 def walk(obj):
  if isinstance(obj,dict):
   if "pmid" in obj and ("title" in obj or "verified_title" in obj):
    if obj.get("doi"): dois.add(norm_doi(obj["doi"]))
    title=norm_title(obj.get("title") or obj.get("verified_title"))
    if title: titles.add(title)
   for v in obj.values(): walk(v)
  elif isinstance(obj,list):
   for v in obj: walk(v)
 for folder in ("ops/enrichment-submissions/reconciliation","data-sources/runtime-enrichment"):
  for p in (ROOT/folder).glob("*.json"):
   try: walk(json.loads(p.read_text()))
   except (ValueError,UnicodeError): continue
 # Draft PR is not merged. It is nevertheless an exclusion set.
 for k in range(1,6):
  p=f"ops/enrichment-submissions/reconciliation/2026-10-08-enrichment-waves-7501-8000-source-verified-part-0{k}.json"
  part=json.loads(subprocess.check_output(["git","show","FETCH_HEAD:"+p],cwd=ROOT,text=True))
  walk(part)
 return pmids,dois,titles,head
def fetch(ids):
 root=get("efetch.fcgi",{"db":"pubmed","id":",".join(ids),"retmode":"xml","tool":"THSLane4"})
 out={}
 for x in root.findall("./PubmedArticle"):
  c=x.find("MedlineCitation");a=c.find("Article") if c is not None else None
  if a is None:continue
  pmid=text(c.find("PMID"));title=text(a.find("ArticleTitle"))
  ab=" ".join(((n.get("Label") or "")+": " if n.get("Label") else "")+text(n) for n in a.findall("./Abstract/AbstractText")).strip()
  doi=""
  for n in x.findall("./PubmedData/ArticleIdList/ArticleId"):
   if n.get("IdType")=="doi":doi=text(n);break
  if not doi:
   for n in a.findall("./ELocationID"):
    if n.get("EIdType")=="doi":doi=text(n);break
  types=[text(n) for n in a.findall("./PublicationTypeList/PublicationType")]
  out[pmid]={"pmid":pmid,"title":title,"abstract":ab,"doi":norm_doi(doi),"publication_types":types,
    "journal":text(a.find("./Journal/Title")),"pub_date":text(a.find("./Journal/JournalIssue/PubDate"))}
 return out
def main():
 pmids,dois,titles,head=existing();rows=[];rejected=[]
 for category,quota,query in TOPICS:
  root=get("esearch.fcgi",{"db":"pubmed","term":f'({query}) AND hasabstract[text] AND Humans[MeSH Terms] AND 2014:2026[pdat] NOT "Retracted Publication"[pt] NOT "Case Reports"[pt]',"retmax":"250","sort":"pub date","retmode":"xml"})
  ids=[n.text for n in root.findall("./IdList/Id") if n.text]
  found=0
  for i in range(0,len(ids),30):
   for rec in fetch(ids[i:i+30]).values():
    pmid=rec["pmid"];doi=rec["doi"];title=norm_title(rec["title"])
    why=None
    if pmid in pmids:why="pmid_in_main_or_open_pr"
    elif doi and doi in dois:why="normalized_doi_duplicate"
    elif title in titles:why="normalized_title_duplicate"
    elif len(rec["abstract"])<160:why="abstract_missing_or_short"
    elif len(rec["title"])<18:why="title_missing"
    elif not any(k in " ".join(rec["publication_types"]).lower() for k in ("randomized controlled trial","clinical trial","observational study","systematic review","meta-analysis","cohort","comparative study","journal article")):why="study_design_not_sufficiently_characterized"
    elif re.search(r"\b(mouse|mice|rat|rodent|animal model|protocol|in vitro|retraction)\b",rec["title"],re.I):why="nonhuman_protocol_or_retraction"
    if why:
     rejected.append({"pmid":pmid,"reason":why});continue
    rec.update({"lane":"4","category":category,"source":"NCBI PubMed ESearch + direct EFetch XML",
      "pubmed_url":"https://pubmed.ncbi.nlm.nih.gov/"+pmid+"/",
      "abstract_sha256":hashlib.sha256(rec["abstract"].encode()).hexdigest(),
      "title_verified":True,"abstract_verified":True,"research_only":True,
      "semantic_review":"PENDING_INDEPENDENT_REVIEW",
      "applicability":"NOT_YET_ASSESSED","safety":"NOT_YET_ASSESSED",
      "negative_findings":"NOT_YET_EXTRACTED","uncertainty":"NOT_YET_ASSESSED",
      "semantic_relationships":"NOT_YET_REVIEWED","clinical_claim_admitted":False})
    rows.append(rec);pmids.add(pmid);titles.add(title)
    if doi:dois.add(doi)
    found+=1
    if found==quota:break
   if found==quota:break
  if found!=quota:raise RuntimeError(f"{category}: only {found}/{quota} source-verified eligible records; fail closed")
 assert len(rows)==25 and len({r["pmid"] for r in rows})==25
 assert len({norm_title(r["title"]) for r in rows})==25
 assert len({r["doi"] for r in rows if r["doi"]})==len([r for r in rows if r["doi"]])
 obj={"schema_version":1,"lane":4,"date":"2026-10-08","main_predecessor_pmids":7435,
   "excluded_open_pr_pmids":500,"open_pr_head_checked":head,"candidate_count":len(rows),
   "source_verified_count":len(rows),"integrated":0,"published":0,"research_only":True,
   "semantic_review":"PENDING","rows":rows,"rejected":rejected}
 OUT.parent.mkdir(parents=True,exist_ok=True)
 data=(json.dumps(obj,ensure_ascii=False,indent=2)+"\n").encode()
 OUT.write_bytes(data)
 MANIFEST.write_text(json.dumps({"lane":4,"records":25,"file":OUT.name,"sha256":hashlib.sha256(data).hexdigest(),
  "bytes":len(data),"open_pr_head_checked":head,"semantic_review":"PENDING","research_only":True,
  "runtime_admission":False,"publication":False},indent=2)+"\n")
 print(json.dumps({"source_verified":25,"integrated":0,"staged":25,"merged":0,
   "rejected_candidates":len(rejected),"open_pr_head":head}))
if __name__=="__main__":main()
