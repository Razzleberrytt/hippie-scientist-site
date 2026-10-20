"""Fast, dependency-free regression tests for spoken-only lexicon."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from voice_pronunciation import apply_pronunciations, lexicon_receipt, load_lexicon


class VoicePronunciationTests(unittest.TestCase):
    def test_owner_and_dictionary_readings(self):
        self.assertEqual(
            apply_pronunciations("Kratom leaf contains mitragynine."),
            "craytum leaf contains mitragynine."
        )

    def test_owner_rejected_split_syllables(self):
        output = apply_pronunciations("Mitragynine is found in kratom.")
        self.assertEqual(output, "mitragynine is found in craytum.")
        self.assertNotIn("mih-traj-uh-neen", output)

    def test_whole_words_only_and_punctuation(self):
        text = "superkratom mitragynines 7-hydroxymitragynine; KRATOM, mitragynine!"
        self.assertEqual(apply_pronunciations(text),
                         "superkratom mitragynines 7-hydroxymitragynine; craytum, mitragynine!")

    def test_empty_or_unrelated_text_is_unchanged(self):
        for text in ("", "Research suggests the effect is uncertain.", "Mitragyna speciosa"):
            self.assertEqual(apply_pronunciations(text), text)

    def test_receipt_binds_versioned_dictionary_and_requires_audio_review(self):
        entries, digest = load_lexicon()
        self.assertEqual({x["term"] for x in entries}, {"kratom", "mitragynine"})
        receipt = lexicon_receipt()
        self.assertEqual(receipt["sha256"], digest)
        self.assertEqual(receipt["application"], "narration-audio-only")
        self.assertEqual(receipt["humanAuditoryReview"], "required")

    def test_corrupt_dictionary_fails_closed(self):
        entries = [{"term": "kratom", "spokenAs": "craytum", "source": "owner"}]
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "lexicon.json"
            for item in [
                {"schemaVersion": "wrong", "language": "en-US", "entries": entries},
                {"schemaVersion": "ths-voice-pronunciation-lexicon-v1",
                 "language": "en-US", "entries": entries * 2},
                {"schemaVersion": "ths-voice-pronunciation-lexicon-v1",
                 "language": "en-US", "entries": [{"term": "kratom", "spokenAs": "", "source": "owner"}]},
                {"schemaVersion": "ths-voice-pronunciation-lexicon-v1",
                 "language": "en-US", "entries": [{"term": "kratom", "spokenAs": "k-ray-tum", "source": "owner"}]},
            ]:
                path.write_text(json.dumps(item), encoding="utf-8")
                with self.assertRaises(ValueError):
                    apply_pronunciations("kratom", path)


if __name__ == "__main__":
    unittest.main()
