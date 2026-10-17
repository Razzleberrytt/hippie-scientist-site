#!/usr/bin/env python3
"""Independent automatic speech-recognition negative filter; NEVER human approval."""
from pathlib import Path
from difflib import SequenceMatcher
import json, hashlib, re
from faster_whisper import WhisperModel
root=Path('gut-narration');out=Path('gut-asr-audit');out.mkdir(exist_ok=True)
voice=json.loads((root/'original_voice_receipt.json').read_text())
wav=root/voice['master_file']
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
if sha(wav)!=voice['master_sha256'] or voice['master_sha256']!='e19bf6f01168e1df461de3d67f822c2ba4f74c26421db2763dff0fe2ad161477':
 raise RuntimeError('Exact original pinned source WAV missing or changed')
script=' '.join(s['text'] for s in voice['scenes'])
model=WhisperModel('tiny.en', device='cpu', compute_type='int8', download_root='gut-asr-model-cache')
segments,info=model.transcribe(str(wav),language='en',beam_size=5,condition_on_previous_text=False,vad_filter=False)
recognized=' '.join(s.text.strip() for s in segments).strip()
norm=lambda s:re.sub('[^a-z0-9]+',' ',s.lower()).strip()
reference=norm(script);observed=norm(recognized)
ratio=SequenceMatcher(None,reference.split(),observed.split()).ratio()
result=dict(schema='ths.gut.original_kokoro.independent_tiny_en_asr.v1',mayPublish=False,originalVoiceSHA256=voice['master_sha256'],recognizer='faster-whisper tiny.en CPU int8',referenceScript=script,recognized=recognized,normalizedReference=reference,normalizedRecognized=observed,tokenSimilarityRatio=ratio,modelConfidenceIsNotPronunciationProof=True,nonhemeRecognized=('nonheme' in observed or 'non heme' in observed),humanEarReview='NOT_PERFORMED',qaDecision='RESEARCH_NEGATIVE_FILTER_ONLY')
(out/'WHISPER_INDEPENDENT_SOURCE_ASR.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['recognized','tokenSimilarityRatio','nonhemeRecognized','qaDecision']},indent=2),flush=True)
