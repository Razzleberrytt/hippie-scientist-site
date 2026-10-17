#!/usr/bin/env python3
"""Independent ASR check of ORIGINAL SOURCE AUDIO only, never narrator replacement."""
from pathlib import Path
from difflib import SequenceMatcher
from faster_whisper import WhisperModel
import hashlib,json,re
v=Path('phenibut-original-voice');o=Path('phenibut-asr');o.mkdir(exist_ok=True)
r=json.loads((v/'voice_receipt.json').read_text());wav=v/r['master_name']
if hashlib.sha256(wav.read_bytes()).hexdigest()!=r['wav_sha256']:raise RuntimeError('source WAV hash mismatch')
script=' '.join(s['text'] for s in r['scenes'])
model=WhisperModel('base.en',device='cpu',compute_type='int8',download_root='phenibut-model-cache')
segments,info=model.transcribe(str(wav),language='en',beam_size=5,condition_on_previous_text=False,vad_filter=False)
output=' '.join(s.text.strip() for s in segments)
norm=lambda t:re.sub('[^a-z0-9]+',' ',t.lower()).strip()
ratio=SequenceMatcher(None,norm(script).split(),norm(output).split()).ratio()
report=dict(schema='ths.phenibut.independent_orig_audio_asr.v1',source_wav_sha256=r['wav_sha256'],independent_model='faster-whisper base.en CPU int8',exactScript=script,recognized=output,tokenSimilarity=ratio,phenibutRecognized=('phenibut' in norm(output) or 'pheni' in norm(output)),year2009Recognized=('2009' in norm(output) or 'two thousand nine' in norm(output) or 'twenty oh nine' in norm(output)),year2019Recognized=('2019' in norm(output) or 'two thousand nineteen' in norm(output) or 'twenty nineteen' in norm(output)),humanEarReview='UNVERIFIED',mayPublish=False)
(o/'INDEPENDENT_SOURCE_ASR.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['recognized','tokenSimilarity','phenibutRecognized','year2009Recognized','year2019Recognized']},indent=2),flush=True)
