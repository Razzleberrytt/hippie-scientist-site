"""Read-only voice revision tests; no regenerated natural speech or owner approval."""
import hashlib
import io
import struct
import unittest
import wave
from voice_revision_invalidation import check_voice_revision, REBUILD


def make_voice_like_wav(n=30000):
    bio = io.BytesIO()
    with wave.open(bio, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(24000)
        w.writeframes(struct.pack('<' + 'h'*n, *(int(11000 * __import__('math').sin(i * .1)) for i in range(n))))
    return bio.getvalue()


class RevisionInvalidationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = make_voice_like_wav()
        cls.sha = hashlib.sha256(cls.source).hexdigest()
        cls.receipts = {name: {'narrationSha256': cls.sha,
                               'artifactSha256': hashlib.sha256(name.encode()).hexdigest()}
                        for name in REBUILD}

    def test_unchanged_source_has_no_false_new_approvals(self):
        r = check_voice_revision(self.source, self.source, self.sha, self.receipts)
        self.assertEqual(r['status'], 'UNCHANGED_VOICE_RESEARCH_IDENTITY_ONLY')
        self.assertEqual(r['invalidate'], [])
        self.assertFalse(r['mayPublish'])
        self.assertFalse(r['previousReceiptsReusable'])

    def test_single_pcm_sample_change_invalidates_every_old_approval(self):
        changed = bytearray(self.source)
        changed[-3] ^= 3
        r = check_voice_revision(self.source, bytes(changed), self.sha, self.receipts)
        self.assertEqual(r['status'], 'HOLD_NARRATION_CHANGED_REBUILD_REQUIRED')
        self.assertEqual(set(r['invalidate']), set(REBUILD))
        self.assertFalse(r['priorReceiptIdentitiesMatchBaseline'])
        self.assertFalse(r['mayPublish'])

    def test_new_receipt_looking_hash_cannot_self_approve_revision(self):
        changed = bytearray(self.source)
        changed[-3] ^= 1
        forged = {k: {**v, 'narrationSha256': hashlib.sha256(changed).hexdigest()}
                  for k, v in self.receipts.items()}
        r = check_voice_revision(self.source, bytes(changed), self.sha, forged)
        self.assertEqual(r['status'], 'HOLD')
        self.assertTrue(r['errors'][0].startswith('PRIOR_RECEIPT_IDENTITY_INVALID'))

    def test_missing_prior_category_blocks_reuse(self):
        r = check_voice_revision(self.source, self.source, self.sha,
                                 {k: v for k, v in self.receipts.items() if k != REBUILD[-1]})
        self.assertEqual(r['status'], 'HOLD')
        self.assertFalse(r['mayPublish'])

    def test_old_vault_sha_mismatch_rejects_candidate(self):
        r = check_voice_revision(self.source, self.source, 'f'*64)
        self.assertEqual(r['status'], 'HOLD')
        self.assertIn('ORIGINAL_VAULT_SHA_MISMATCH', r['errors'])

    def test_invalid_or_truncated_candidate_refused(self):
        self.assertEqual(check_voice_revision(self.source, b'not a wav', self.sha)['status'], 'HOLD')
        self.assertEqual(check_voice_revision(self.source, self.source[:-20], self.sha)['status'], 'HOLD')


if __name__ == '__main__':
    unittest.main()
