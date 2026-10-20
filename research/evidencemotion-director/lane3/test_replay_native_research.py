"""Contract-only negative tests for one-step Scene4 native research integration."""
from pathlib import Path
import hashlib
import json
import tempfile
import unittest
import replay_native_research as R
import native_scene4 as S
ROOT=Path(__file__).resolve().parent
M=ROOT/'scene4-github-native-render-20261016.json'
PIN='728451fe3ed11f115953d43416be9ed911afaede450a7eb21f8475c6bc0601a8'
class ReplayContract(unittest.TestCase):
  def run_bad(self,mutate):
    with tempfile.TemporaryDirectory() as d:
      x=json.loads(M.read_text());mutate(x)
      fake=Path(d)/'changed.json';fake.write_text(json.dumps(x))
      try:
        R.run(source=Path('missing.mp4'),mol=Path('missing.mol'),manifest=fake,
              external_manifest_sha=hashlib.sha256(fake.read_bytes()).hexdigest(),
              output=Path(d)/'film.mp4')
      except R.ReplayHold as e:return str(e)
      self.fail('expected fail-closed hold')
  def test_unknown_film_source_is_rejected(self):
    self.assertEqual(self.run_bad(lambda x:x.update(sourceFilmSha256='1'*64)),
                     'UNKNOWN_APPROVED_NARRATION_FILM')
  def test_unreviewed_narration_change_is_rejected(self):
    self.assertEqual(self.run_bad(lambda x:x.update(originalNarrationSha256='a'*64)),
                     'ORIGINAL_NARRATION_IDENTITY_CHANGED')
  def test_retimed_scene_is_rejected(self):
    self.assertEqual(self.run_bad(lambda x:x.update(startFrame=497)),
                     'AUTHORED_SCENE_OR_NATIVE_TIMELINE_MISMATCH')
  def test_auditory_cue_retime_is_rejected(self):
    self.assertEqual(self.run_bad(lambda x:x.update(negationSpokenOnsetSec=19.82)),
                     'SCENE_AUDIO_CUE_REVISION_MISMATCH')
  def test_original_input_cannot_be_overwritten(self):
    with self.assertRaisesRegex(R.ReplayHold,'INVALID_OUTPUT_DESTINATION'):
      R.run(source=Path('movie.mp4'),mol=Path('mol.mol'),manifest=M,
            external_manifest_sha=PIN,output=Path('movie.mp4'))
if __name__=='__main__':unittest.main()
