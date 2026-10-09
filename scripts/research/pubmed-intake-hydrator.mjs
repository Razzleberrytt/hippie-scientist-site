const LANE_FOCUS={1:'sleep-stress-mood',2:'cognition-metabolic',3:'botanical-pharmacology-safety',4:'withdrawal-dependence-nps',5:'contradictions-replication'};

const decodeXml=s=>String(s??'')
 .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1')
 .replace(/<[^>]+>/g,' ')
 .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
 .replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")
 .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
 .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
 .replace(/\s+/g,' ').trim();

const tag=(xml,name)=>{const m=String(xml).match(new RegExp('<'+name+'\\b[^>]*>([\\s\\S]*?)<\\/'+name+'>','i'));return m?decodeXml(m[1]):''};
const tags=(xml,name)=>[...String(xml).matchAll(new RegExp('<'+name+'\\b([^>]*)>([\\s\\S]*?)<\\/'+name+'>','gi'))].map(m=>({attrs:m[1]||'',text:decodeXml(m[2])}));

export function validateSeedManifest(seed){
 const lane=Number(seed?.lane);
 if(seed?.schema_version!==1||seed?.seed_only!==true||seed?.research_only!==true)throw Error('invalid research intake seed envelope');
 if(!Number.isInteger(lane)||lane<1||lane>5||seed.lane_focus!==LANE_FOCUS[lane])throw Error('seed lane_focus does not match lane');
 if(!Array.isArray(seed.pmids)||seed.pmids.length<1||seed.pmids.length>25)throw Error('seed must contain 1..25 PMIDs');
 const pmids=seed.pmids.map(String);
 if(pmids.some(p=>!/^\d{5,10}$/.test(p)))throw Error('seed contains invalid PMID');
 if(new Set(pmids).size!==pmids.length)throw Error('seed contains duplicate PMIDs');
 return {...seed,lane,pmids};
}

function publicationYear(xml){
 return tag(xml,'ArticleDate')?Number(tag(xml,'Year'))||null:Number(tag(xml,'Year'))||null;
}
function classifyEvidence(publicationTypes){
 const s=publicationTypes.join(' ').toLowerCase();
 if(/meta-analysis|systematic review|review/.test(s))return 'review';
 if(/randomized controlled trial|clinical trial|observational study|comparative study|evaluation study/.test(s))return 'human';
 return 'mixed';
}
function designLabel(publicationTypes){
 return publicationTypes.length?publicationTypes.join('; '):'PubMed-indexed primary or authoritative source; design classification pending independent review';
}
function laneCategory(lane){
 return {1:'sleep_stress_mood',2:'cognition_metabolic',3:'botanical_pharmacology_safety',4:'withdrawal_dependence_nps',5:'contradictions_replication'}[lane];
}
function defaultRelevance(lane){
 return {
  1:'Source-verified candidate selected for sleep, stress, anxiety, or mood relevance; semantic interpretation remains pending independent review.',
  2:'Source-verified candidate selected for cognition, focus, or metabolic-health relevance; semantic interpretation remains pending independent review.',
  3:'Source-verified candidate selected for botanical, pharmacology, interaction, mechanism, or safety relevance; semantic interpretation remains pending independent review.',
  4:'Source-verified candidate selected for withdrawal, dependence, NPS, overdose, recovery, or harm-reduction relevance; semantic interpretation remains pending independent review.',
  5:'Source-verified candidate selected for contradiction, replication, uncertainty, or emerging-evidence relevance; semantic interpretation remains pending independent review.'
 }[lane];
}

export function parsePubmedArticle(xml,pmid,{lane,lane_focus,relevance_reason}){
 const articles=[...String(xml).matchAll(/<PubmedArticle\b[\s\S]*?<\/PubmedArticle>/gi)].map(m=>m[0]);
 const article=articles.find(a=>tag(a,'PMID')===String(pmid))||articles[0]||String(xml);
 const title=tag(article,'ArticleTitle');
 const abstractParts=tags(article,'AbstractText').map(x=>x.text).filter(Boolean);
 const abstract=abstractParts.join(' ');
 const ids=tags(article,'ArticleId');
 const doiEntry=ids.find(x=>/IdType\s*=\s*["']doi["']/i.test(x.attrs));
 const publicationTypes=tags(article,'PublicationType').map(x=>x.text).filter(Boolean);
 const journal=tag(article,'Title')||tag(article,'ISOAbbreviation');
 if(!title)throw Error('PubMed hydration missing title for PMID '+pmid);
 if(abstract.length<70)throw Error('PubMed hydration missing usable abstract for PMID '+pmid);
 return {
  pmid:String(pmid),
  title,
  ...(doiEntry?.text?{doi:doiEntry.text}:{}),
  source_title:title,
  abstract,
  source_url:'https://pubmed.ncbi.nlm.nih.gov/'+pmid+'/',
  research_domain:lane_focus,
  category:laneCategory(lane),
  relevance_reason:relevance_reason||defaultRelevance(lane),
  evidence_class:classifyEvidence(publicationTypes),
  study_design:designLabel(publicationTypes),
  study_details:{
   hydration:'pubmed_efetch_xml',
   publication_types:publicationTypes,
   structured_semantic_extraction:'pending_independent_review'
  },
  population:{status:'pending_independent_review',source:'verified PubMed abstract'},
  intervention:{status:'pending_independent_review',source:'verified PubMed abstract'},
  outcomes:['Structured outcome extraction pending independent scientific review; verified source abstract retained verbatim.'],
  conclusion_direction:'not_applicable',
  interaction_evidence_level:'none',
  uncertainty:{status:'pending_independent_review',note:'Source identity is verified; clinical and semantic interpretation is intentionally deferred.'},
  adverse_effects:{status:'pending_independent_review'},
  interactions:{status:'pending_independent_review'},
  limitations:{status:'pending_independent_review',note:'Hydration does not infer study limitations beyond the source metadata and abstract.'},
  provenance:{
   source:'PubMed EFetch XML',
   pmid:String(pmid),
   ...(doiEntry?.text?{doi:doiEntry.text}:{}),
   ...(journal?{journal}:{}),
   ...(publicationYear(article)?{publication_year:publicationYear(article)}:{}),
   hydrated_at:new Date().toISOString(),
   source_verification:'title and abstract fetched directly from PubMed; semantic review pending'
  },
  signals:{safety:0,evidence_gap:1,contradiction:0,novelty:0.5,graph_connectivity:0},
  clinical_claim:false,causal_claim:false,positive_claim:false,single_ingredient_claim:false,interaction_claim:false
 };
}

export async function hydrateSeedManifest(seed,{fetchImpl=fetch}={}){
 const s=validateSeedManifest(seed);
 const url='https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id='+encodeURIComponent(s.pmids.join(','));
 const response=await fetchImpl(url,{headers:{'User-Agent':'ths-research-intake/1.0 (source-verification; no automated publication)'}});
 if(!response.ok)throw Error('PubMed EFetch failed '+response.status);
 const xml=await response.text();
 const records=s.pmids.map(pmid=>parsePubmedArticle(xml,pmid,s));
 return {schema_version:1,lane:s.lane,lane_focus:s.lane_focus,research_only:true,records};
}

export async function hydrateIntakeEnvelope(input,options={}){
 return input?.seed_only===true?hydrateSeedManifest(input,options):input;
}
