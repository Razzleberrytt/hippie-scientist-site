#!/usr/bin/env python3
"""THS Phenibut harm-reduction narrated WAV using pinned original Kokoro am_michael. Research only."""
from pathlib import Path
import hashlib,json,os,wave
import numpy as np
from kokoro_onnx import Kokoro
W=Path('voice-assets');O=Path('phenibut-original-voice');O.mkdir(exist_ok=True)
pins={'kokoro-v1.0.int8.onnx':'ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c','voices-v1.0.bin':'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d'}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for n,h in pins.items():
 if sha(W/n)!=h:raise RuntimeError('Original Kokoro asset mismatch: '+n)
beats=[
 ('hook',"Sold as a calming supplement. Withdrawal can mean a hospital visit."),
 ('mechanism',"It's phenibut. It affects GABA B signaling in the brain."),
 ('dependence',"Repeated use can cause dependence. Stopping can trigger anxiety and insomnia."),
 ('danger',"Some reported withdrawals include agitation, hallucinations, and seizures."),
 ('data',"The C D C counted thirteen hundred twenty phenibut poison center exposure calls from 2009 through 2019."),
 ('care',"The F D A says it isn't a dietary ingredient. If you're dependent, get medical advice before stopping."),
]
engine=Kokoro(str(W/'kokoro-v1.0.int8.onnx'),str(W/'voices-v1.0.bin'))
clips=[];scenes=[];pos=0.;rate=24000
for i,(id,text) in enumerate(beats):
 y,sr=engine.create(text,voice='am_michael',speed=1.0,lang='en-us')
 if int(sr)!=rate:raise RuntimeError('Sample rate drift')
 y=np.asarray(y,dtype=np.float32).reshape(-1)
 if not np.all(np.isfinite(y)) or len(y)<4800 or np.max(np.abs(y))>1:raise RuntimeError('Invalid voice')
 pcm=np.asarray(np.round(np.clip(y,-1,1)*32767),dtype='<i2')
 p=O/f'{i+1:02d}_{id}.wav'
 with wave.open(str(p),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(pcm.tobytes())
 dur=len(y)/rate
 scenes.append(dict(id=id,text=text,voice_start_s=round(pos,6),voice_end_s=round(pos+dur,6),speech_s=round(dur,6),clip_name=p.name,clip_sha256=sha(p),rms=float(np.sqrt(np.mean(y*y))),peak=float(np.max(np.abs(y)))))
 clips.append(pcm);pos+=dur
 if i<len(beats)-1:
  pause=np.zeros(round(.20*rate),dtype='<i2');clips.append(pause);pos+=len(pause)/rate
master=O/'Phenibut_ORIGINAL_KOKORO.wav'
with wave.open(str(master),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(np.concatenate(clips).tobytes())
receipt=dict(schema='ths.phenibut.original_voice.r1',speaker='am_michael',engine='kokoro-onnx==0.6.1',assets_sha256=pins,wav_sha256=sha(master),master_name=master.name,seconds=round(pos,6),scenes=scenes,word_alignment='NOT_PERFORMED',phonetic_qa='NOT_PERFORMED',mayPublish=False)
(O/'voice_receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'success':True,'seconds':pos,'sha256':sha(master),'scenes':len(scenes)},indent=2))
