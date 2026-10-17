#!/usr/bin/env python3
"""Phenibut original-voice acoustic word alignment DRAFT. <eps> silence is not a word. OOV never silently approved."""
from pathlib import Path
from subprocess import run
from hashlib import sha256
import json,re
v=Path('phenibut-original-voice');o=Path('phenibut-mfa');o.mkdir(exist_ok=True)
rc=json.loads((v/'voice_receipt.json').read_text())
wav=v/rc['master_name']
hash=lambda p:sha256(p.read_bytes()).hexdigest()
if hash(wav)!=rc['wav_sha256']:raise RuntimeError('Source audio changed')
expected=[(s,w) for s in rc['scenes'] for w in s['text'].split()]
t=o/'transcript.txt';t.write_text(' '.join(s['text'] for s in rc['scenes'])+'\n')
raw=o/'mfa_raw.json'
cmd=['mfa','align_one','--output_format','json','--no_tokenization',str(wav),str(t),'english_us_arpa','english_us_arpa',str(raw)]
p=run(cmd,capture_output=True,text=True,timeout=800)
if p.returncode or not raw.exists():raise RuntimeError('MFA process failed: '+p.stderr[-1000:])
r=json.loads(raw.read_text())
tiers=[val['entries'] for name,val in r.get('tiers',{}).items() if 'words' in name.lower() and isinstance(val,dict) and isinstance(val.get('entries'),list)]
if len(tiers)!=1:raise RuntimeError('MFA words tier absent')
rows=[(float(x),float(y),str(z)) for x,y,z in tiers[0] if str(z).strip() and str(z)!='<eps>']
if len(rows)!=len(expected):
 print('MFA tokens:',[w for a,b,w in rows],flush=True)
 print('Expected:',[w for scene,w in expected],flush=True)
 raise RuntimeError(f'word count difference: {len(rows)} vs {len(expected)}')
norm=lambda x:re.sub('[^a-z0-9]','',x.lower())
unmatched=[];words=[];prev=0.0
for i,((s,w),(a,b,got)) in enumerate(zip(expected,rows)):
 if got=='<unk>':
  unmatched.append(dict(index=i,word=w,scene=s['id'],reason='MFA OOV; needs independent pronunciation confirmation'))
 elif norm(w)!=norm(got):raise RuntimeError(f'Token {i} mismatch {w} != {got}')
 if not(a+0.021>=prev and a<b and a>=s['voice_start_s']-.2 and b<=s['voice_end_s']+.2):
  raise RuntimeError(f'Timing mismatch {i} {w} {a}..{b} in {s["id"]}')
 words.append(dict(index=i,word=w,scene=s['id'],start=round(a,3),end=round(b,3),acousticWord=got))
 prev=b
rec=dict(schema='ths.phenibut.real_mfa_word_alignment.draft.v1',voiceSHA256=rc['wav_sha256'],MFArawSHA256=hash(raw),engine='Montreal Forced Aligner english_us_arpa',actualSpeechAligned=True,wordCount=len(words),words=words,unknownPronunciationTokens=unmatched,acousticModelVersionPin=None,dictionaryVersionPin=None,manualListeningApproved=False,postingApproved=False)
(o/'MFA_VERIFIED_WORD_TIMES_DRAFT.json').write_text(json.dumps(rec,indent=2)+'\n')
print('MFA MATCHED',len(words),'OOV',unmatched,flush=True)
