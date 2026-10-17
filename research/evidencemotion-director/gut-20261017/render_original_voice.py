#!/usr/bin/env python3
"""Research-only original THS Kokoro narration; NO auto-publish, NO fallback."""
import hashlib, json, os, pathlib, sys, wave
import numpy as np
from kokoro_onnx import Kokoro

MODEL = pathlib.Path(os.environ.get("THS_MODEL", "voice-assets/kokoro-v1.0.int8.onnx"))
BANK = pathlib.Path(os.environ.get("THS_VOICEBANK", "voice-assets/voices-v1.0.bin"))
OUT = pathlib.Path(os.environ.get("THS_OUTPUT", "gut-narration"))
PINS = {
 "kokoro-v1.0.int8.onnx": "ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c",
 "voices-v1.0.bin": "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
}
SCENES = [
 ("hook", "Taking a supplement is not the same as absorbing it."),
 ("dissolve", "A capsule can open in your gut, but release is not absorption."),
 ("intestine", "Most dietary nutrients cross the lining of your small intestine."),
 ("vitamind", "Fat can help vitamin D absorption, but it is not always required."),
 ("iron", "Vitamin C can help nonheme iron. Tea compounds can lower absorption."),
 ("takeaway", "Form, food, and interactions matter. Read the supplement label."),
]
def sha(p):
 h=hashlib.sha256()
 with open(p,"rb") as f:
  for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
 return h.hexdigest()
for p in [MODEL,BANK]:
 if not p.is_file() or sha(p)!=PINS[p.name]:
  raise RuntimeError("original voice missing/hash mismatch; no substitute allowed: "+str(p))
OUT.mkdir(parents=True,exist_ok=True)
k=Kokoro(str(MODEL),str(BANK))
clips=[]; scenes=[]; cursor=0.0; rate=None
for i,(sid,spoken) in enumerate(SCENES):
 audio,sr=k.create(spoken,voice="am_michael",speed=1.0,lang="en-us")
 audio=np.asarray(audio,dtype=np.float32).reshape(-1)
 if rate is None:rate=int(sr)
 if int(sr)!=rate or rate!=24000:raise RuntimeError("Kokoro sample-rate drift")
 if not np.all(np.isfinite(audio)) or len(audio)<4000 or np.max(np.abs(audio))>1.0:
  raise RuntimeError("invalid generated source speech: "+sid)
 pcm=np.int16(np.clip(audio,-1,1)*32767)
 dest=OUT/f"{i+1:02d}_{sid}_ORIGINAL_KOKORO.wav"
 with wave.open(str(dest),"wb") as wav:
  wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes(pcm.tobytes())
 dur=len(pcm)/rate
 scenes.append(dict(id=sid,text=spoken,start_s=round(cursor,6),speech_end_s=round(cursor+dur,6),duration_s=round(dur,6),wav=dest.name,wav_sha256=sha(dest),peak=float(np.max(np.abs(audio))),rms=float(np.sqrt(np.mean(audio**2)))))
 clips.append(pcm)
 if i<len(SCENES)-1:
  gap=np.zeros(round(0.23*rate),dtype=np.int16);clips.append(gap)
  cursor+=dur+len(gap)/rate
 else:cursor+=dur
master=OUT/"Gut_Absorption_ORIGINAL_KOKORO_UNREVIEWED.wav"
with wave.open(str(master),"wb") as wav:
 wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes(np.concatenate(clips).tobytes())
manifest=dict(schema="ths.evidencemotion.gut.original_voice.draft.v1",mayPublish=False,voice_engine="kokoro-onnx 0.6.1",speaker="am_michael",model_sha256=sha(MODEL),voicebank_sha256=sha(BANK),master_file=master.name,master_sha256=sha(master),sample_rate_hz=rate,master_duration_s=round(cursor,6),scenes=scenes,word_alignment="NOT_PERFORMED",auditory_review="NOT_PERFORMED",science_release_approval=False,note="Actual voice owns future visual timing. Do not burn proportional captions or auto-publish.")
(OUT/"original_voice_receipt.json").write_text(json.dumps(manifest,indent=2)+"\n")
print(json.dumps(dict(status="ORIGINAL_KOKORO_WAV_RENDERED_REVIEW_ONLY",file=master.name,duration_s=round(cursor,3),scene_count=len(scenes),sha256=sha(master)),indent=2))
