"""Mock GitHub search contracts: live data, not a silently dated snapshot."""
import unittest
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs

from github_em_merge_snapshot import category, live_observation, search_all


class LiveProgressRetrievalTests(unittest.TestCase):
    def fixture(self, url, token):
        self.assertEqual(token, "fixture-token")
        parsed=urlparse(url)
        if parsed.path=="/search/issues":
            q=parse_qs(parsed.query)["q"][0]
            if "is:merged" in q:
                return {"total_count":1,"items":[{"number":6858,"title":
                    "EvidenceMotion Lane 4: SHA-bound reading-load checks"}]}
            if "is:open" in q:
                return {"total_count":1,"items":[{"number":6859,"title":
                    "EvidenceMotion Lane 5: phone plan receiver"}]}
            raise AssertionError("unexpected query "+q)
        if parsed.path=="/repos/Razzleberrytt/hippie-scientist-site/pulls/6858":
            return {"number":6858,"merged_at":"2026-10-17T19:16:51Z",
                "merge_commit_sha":"50094dde442c178e941b913dcb39b00ca652f777"}
        raise AssertionError("unexpected URL "+url)

    def test_live_merge_sha_and_open_pr_read_directly_from_api(self):
        out=live_observation("fixture-token",
            now=datetime(2026,10,17,19,30,tzinfo=timezone.utc),fetch=self.fixture)
        self.assertEqual(out["source"],"LIVE_GITHUB_API_VERIFIED")
        self.assertEqual(out["observedDate"],"2026-10-17")
        self.assertEqual(out["mergedWindowStart"],"2026-10-17")
        self.assertEqual(out["mergedPRs"][0]["mergeCommitSha"],
                         "50094dde442c178e941b913dcb39b00ca652f777")
        self.assertEqual(out["mergedPRs"][0]["lane"],"lane4")
        self.assertEqual(out["openPRs"][0]["lane"],"lane5")

    def test_merged_since_baseline_survives_next_date(self):
        out=live_observation("fixture-token",
            now=datetime(2026,10,18,1,30,tzinfo=timezone.utc),fetch=self.fixture)
        self.assertEqual(out["observedDate"],"2026-10-18")
        self.assertEqual(out["mergedPRs"][0]["mergedAt"][:10],"2026-10-17")

    def test_missing_auth_and_incomplete_search_holds(self):
        with self.assertRaisesRegex(ValueError,"TOKEN_REQUIRED"):
            live_observation("",fetch=self.fixture)
        def truncated(url, token):
            return {"total_count":3,"items":[]}
        with self.assertRaisesRegex(ValueError,"INCOMPLETE_GITHUB_SEARCH"):
            search_all("repo:sample is:pr is:merged", "fixture-token", truncated)

    def test_unknown_lane_not_accidentally_promoted_to_active_lane(self):
        self.assertEqual(category("EvidenceMotion Lane 6 archive"),"ancillary_research")
        self.assertEqual(category("Research-only exact gut-absorption V9 film"),"daily_video_audit")
        self.assertEqual(category("EvidenceMotion integrated research"),"integration")


if __name__=="__main__":
    unittest.main()
