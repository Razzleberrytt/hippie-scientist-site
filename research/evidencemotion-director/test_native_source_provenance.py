import copy
import hashlib
import tempfile
import unittest
from pathlib import Path
from native_source_provenance import validate

H=lambda data:hashlib.sha256(data).hexdigest()
class ProvenanceTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
  self.root=Path(self.temp.name)
  self.src={f'input-{i}.dat':f'source {i}'.encode() for i in range(4)}
  self.src['final.mp4']=b'test h264 content dummy'
  for name,b in self.src.items():(self.root/name).write_bytes(b)
  self.manifest={'sourceInputs':{k:H(b) for k,b in self.src.items() if k!='final.mp4'},
   'originalFinalSha256':H(self.src['final.mp4']),'finalNativeMasterPath':'final.mp4',
   'notReleasableWithoutFinalQualityReview':True}
 def test_valid_bundle_is_not_release_approval(self):
  x=validate(self.root,self.manifest)
  self.assertEqual(x['status'],'PASS');self.assertFalse(x['releaseApproved']);self.assertFalse(x['nativeSourceProof'])
 def test_changed_source_blocks(self):
  (self.root/'input-2.dat').write_bytes(b'changed')
  self.assertIn('SOURCE_HASH_MISMATCH:input-2.dat',validate(self.root,self.manifest)['errors'])
 def test_changed_master_blocks(self):
  (self.root/'final.mp4').write_bytes(b'changed')
  self.assertIn('MASTER_HASH_MISMATCH',validate(self.root,self.manifest)['errors'])
 def test_traversal_blocks(self):
  m=copy.deepcopy(self.manifest);m['sourceInputs']['../secret']='a'*64
  self.assertEqual(validate(self.root,m)['status'],'HOLD')
 def test_symlink_blocks(self):
  (self.root/'input-1.dat').unlink();(self.root/'input-1.dat').symlink_to(self.root/'input-0.dat')
  self.assertEqual(validate(self.root,self.manifest)['status'],'HOLD')
 def test_missing_file_blocks(self):
  (self.root/'input-2.dat').unlink()
  self.assertEqual(validate(self.root,self.manifest)['status'],'HOLD')
 def test_malformed_hash_blocks(self):
  m=copy.deepcopy(self.manifest);m['sourceInputs']['input-1.dat']='no'
  self.assertEqual(validate(self.root,m)['status'],'HOLD')
 def test_missing_quality_hold_blocks(self):
  m=copy.deepcopy(self.manifest);m['notReleasableWithoutFinalQualityReview']=False
  self.assertIn('MISSING_RELEASE_HOLD',validate(self.root,m)['errors'])
 def test_noncanonical_relative_path_blocks(self):
  m=copy.deepcopy(self.manifest);m['sourceInputs']['/etc/passwd']='b'*64
  self.assertEqual(validate(self.root,m)['status'],'HOLD')
 def test_noncanonical_master_alias_fails_closed(self):
  m=copy.deepcopy(self.manifest);m['finalNativeMasterPath']='./final.mp4'
  self.assertEqual(validate(self.root,m)['status'],'HOLD')
  self.assertTrue(any(x.startswith('MASTER_UNAVAILABLE_OR_UNSAFE') for x in validate(self.root,m)['errors']))
 def test_noncanonical_source_alias_fails_closed(self):
  m=copy.deepcopy(self.manifest);m['sourceInputs']['./final.mp4']=H(self.src['final.mp4'])
  self.assertEqual(validate(self.root,m)['status'],'HOLD')
  self.assertTrue(any(x.startswith('SOURCE_UNAVAILABLE_OR_UNSAFE') for x in validate(self.root,m)['errors']))
 def test_master_as_source_blocks(self):
  m=copy.deepcopy(self.manifest);m['sourceInputs']['final.mp4']=H(self.src['final.mp4'])
  self.assertIn('MASTER_MUST_NOT_BE_OWN_SOURCE',validate(self.root,m)['errors'])
if __name__=='__main__': unittest.main()
