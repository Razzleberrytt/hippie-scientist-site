import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSeedManifest,hydrateSeedManifest,parsePubmedArticle} from './pubmed-intake-hydrator.mjs';

const seed={
 schema_version:1,
 seed_only:true,
 lane:4,
 lane_focus:'withdrawal-dependence-nps',
 research_only:true,
 pmids:['12345']
};

const xml=`<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>12345</PMID><Article><Journal><Title>Journal of Testing</Title><JournalIssue><PubDate><Year>2026</Year></PubDate></JournalIssue></Journal><ArticleTitle>Withdrawal outcome &amp; recovery study</ArticleTitle><Abstract><AbstractText Label="BACKGROUND">Background sentence.</AbstractText><AbstractText Label="RESULTS">This verified abstract is deliberately long enough to pass the intake source-identity gate and contains no inferred semantic claims.</AbstractText></Abstract><PublicationTypeList><PublicationType>Randomized Controlled Trial</PublicationType></PublicationTypeList></Article></MedlineCitation><PubmedData><ArticleIdList><ArticleId IdType="pubmed">12345</ArticleId><ArticleId IdType="doi">10.1000/test</ArticleId></ArticleIdList></PubmedData></PubmedArticle></PubmedArticleSet>`;

test('seed envelope is lane-bound and PMID-only',()=>{
 assert.equal(validateSeedManifest(seed).lane,4);
 assert.throws(()=>validateSeedManifest({...seed,lane_focus:'sleep-stress-mood'}),/lane_focus/);
 assert.throws(()=>validateSeedManifest({...seed,pmids:['abc']}),/invalid PMID/);
 assert.throws(()=>validateSeedManifest({...seed,pmids:['12345','12345']}),/duplicate PMID/);
});

test('PubMed hydration preserves source identity and defers semantics',()=>{
 const record=parsePubmedArticle(xml,'12345',seed);
 assert.equal(record.title,'Withdrawal outcome & recovery study');
 assert.equal(record.source_title,record.title);
 assert.match(record.abstract,/verified abstract/);
 assert.equal(record.doi,'10.1000/test');
 assert.equal(record.research_domain,'withdrawal-dependence-nps');
 assert.equal(record.evidence_class,'human');
 assert.equal(record.conclusion_direction,'not_applicable');
 assert.equal(record.population.status,'pending_independent_review');
 assert.equal(record.provenance.source,'PubMed EFetch XML');
});

test('seed hydration fetches PubMed once and returns a normal intake manifest',async()=>{
 let calls=0;
 const fetchImpl=async url=>{calls++;assert.match(url,/efetch\.fcgi/);return {ok:true,status:200,text:async()=>xml}};
 const hydrated=await hydrateSeedManifest(seed,{fetchImpl});
 assert.equal(calls,1);
 assert.equal(hydrated.records.length,1);
 assert.equal(hydrated.records[0].pmid,'12345');
 assert.equal(hydrated.research_only,true);
});

test('hydration fails closed when PubMed has no usable abstract',async()=>{
 const bad=xml.replace(/<Abstract>[\s\S]*?<\/Abstract>/,'<Abstract><AbstractText>short</AbstractText></Abstract>');
 await assert.rejects(()=>hydrateSeedManifest(seed,{fetchImpl:async()=>({ok:true,status:200,text:async()=>bad})}),/usable abstract/);
});
