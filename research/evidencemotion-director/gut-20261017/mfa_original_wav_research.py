#!/usr/bin/env python3
"""Offline original-WAV MFA research. Never claim approved captions."""
import hashlib,json,re,subprocess
from pathlib import Path
A=Path('gut-narration')
out=Path('gut-alignment');out.mkdir(exist_ok=True)
r=json.loads((A/'original_voice_receipt.json').read_text())
w=A/r['master_file']
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
if sha(w)!=r['master_sha256'] or r['master_sha256']!='e19bf6f01168e1df461de3d67f822c2ba4f74c26421db2763dff0fe2ad161477':
 raise RuntimeError('not the exact source WAV')
words_expected=[]
for scene in r['scenes']:
 for word in scene['text'].split():words_expected.append((scene,word))
text=' '.join(s['text'] for s in r['scenes'])
transcript=out/'transcript.txt';transcript.write_text(text+'\n')
raw=out/'mfa_raw.json'
command=['mfa','align_one','--output_format','json','--no_tokenization',str(w),str(transcript),'english_us_arpa','english_us_arpa',str(raw)]
print('MFA command:',command,flush=True)
q=subprocess.run(command,capture_output=True,text=True,timeout=900)
print(q.stdout[-8000:],q.stderr[-8000:],flush=True)
if q.returncode or not raw.exists():raise RuntimeError('MFA align_one failed: no substitution')
obj=json.loads(raw.read_text())
tiers=[v['entries'] for k,v in obj.get('tiers',{}).items() if 'words' in k.lower() and isinstance(v,dict) and isinstance(v.get('entries'),list)]
if len(tiers)!=1:raise RuntimeError('no unique words tier')
aligned=[dict(start=float(row[0]),end=float(row[1]),word=str(row[2])) for row in tiers[0] if str(row[2]).strip() and str(row[2]).strip()!='<eps>']
def norm(s):return re.sub('[^a-z0-9]','',str(s).lower())
if len(aligned)!=len(words_expected):raise RuntimeError(f'MFA returned {len(aligned)} words vs {len(words_expected)} source')
for i,(real,(scene,target)) in enumerate(zip(aligned,words_expected)):
 if real['word']=='<unk>':
  if norm(target)!='nonheme' or scene['id']!='iron':raise RuntimeError('unexpected unknown acoustic token: '+target)
  real['acoustic_oov']=True
 elif norm(real['word'])!=norm(target):raise RuntimeError(f'word token mismatch {i}: {real["word"]} vs {target}')
 if not (0<=real['start']<real['end']<=r['master_duration_s']+0.04):raise RuntimeError('invalid timing')
 if real['start']<scene['start_s']-0.15 or real['end']>scene['speech_end_s']+0.15:
  raise RuntimeError(f'word outside original speech segment: {i} {real["word"]} {real["start"]} {real["end"]}')
 if i and real['start']<aligned[i-1]['end']-0.02:raise RuntimeError('word overlap')
recipe=dict(schema='ths.gut_original_voice.mfa_research_draft.v1',mayPublish=False,voice_sha256=sha(w),raw_alignment_sha256=sha(raw),acoustic_model='english_us_arpa (downloaded from MFA registry on CI; NOT independently pinned yet)',dictionary='english_us_arpa',word_count=len(aligned),words=aligned,wordLevelAccuracyClaimed=False,oov=[{'word':words_expected[i][1],'scene':words_expected[i][0]['id'],'index':i} for i,w in enumerate(aligned) if w.get('acoustic_oov')],humanAuditoryReview=None,releaseStatus='AWAITING_EXACT_AUDIO_REVIEW')
(out/'WORD_ALIGNMENT_DRAFT.json').write_text(json.dumps(recipe,indent=2)+'\n')
print('MFA research-only word draft tokens verified:',len(aligned),'with OOV unresolved:',len(recipe['oov']),flush=True)
