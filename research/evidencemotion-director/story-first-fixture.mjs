/** Artificial data for tests ONLY; not science, audio, or owner approval. */
const H='a'.repeat(64),V='b'.repeat(64);
const rect=(x1,y1,x2,y2)=>({x1,y1,x2,y2});
export const sampleStoryPlan=()=>({
 schemaVersion:'ths-story-first-research-v1',track:'RESEARCH_ONLY',autoPublish:false,productionIntegration:false,
 sourceManifestSha256:H,lockedNarrationWavSha256:V,durationSec:5,audioRetimed:false,narrationFirst:true,
 question:'What is different?',plainAnswer:'The chemical maps differ, but that alone does not prove human effects.',
 whyItMatters:'The difference leads to research questions.',evidenceBoundary:'Chemical drawings are not human trials.',
 hookExplainsSubjectAtSec:.2,
 acts:['QUESTION','DISCOVERY','EVIDENCE','ANSWER'].map((role,i)=>({
  role,startSec:i*1.25,endSec:(i+1)*1.25,spokenAnchorSec:i*1.25+.2,
  viewerLearns:['topic','source difference','known evidence','careful conclusion'][i],
  visualPurpose:'Explain one source-bound idea',layoutId:'layout'+i,grammarId:'G'+(i+1),
  sourceAssetIds:['source-chemistry-v1'],sourceClaimIds:['claim-v1'],
  visualIntent:['COMPARE_VERIFIED_STRUCTURES','REVEAL_SOURCE_DETAIL','SHOW_EVIDENCE_LIMIT','ANSWER_QUESTION'][i],
  heroBox:rect(.1,.25,.72,.56),captionBox:rect(.08,.68,.75,.74),sourceBox:rect(.08,.76,.75,.81)
 })),
 firstUseTerms:[{term:'hydroxyl',simpleDefinition:'an oxygen-and-hydrogen pair',spokenAtSec:2,explainedAtSec:1.9}],
 claims:[{id:'claim-v1',sourceIds:['source-chemistry-v1'],evidenceClass:'STRUCTURE',assertsHumanEffect:false}],
 scientificEditorialApproved:false,craftApproved:false,ownerApproved:false
});
