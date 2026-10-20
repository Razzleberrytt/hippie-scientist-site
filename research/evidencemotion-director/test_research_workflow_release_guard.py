"""EM-002.03 research-only workflow privilege regression tests (synthetic mutations)."""
import unittest
from research_workflow_release_guard import (
    ROOT, WORKFLOWS, ResearchReleaseHold, inspect
)


class ResearchReleaseGuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.originals = {
            path: (ROOT / path).read_text(encoding="utf-8")
            for path in WORKFLOWS
        }

    def test_both_actual_workflows_read_only_not_publish_authorized(self):
        for path, original in self.originals.items():
            with self.subTest(path=path):
                report = inspect(path, original)
                self.assertEqual(report["status"],
                                 "PASS_DECLARED_READ_ONLY_RESEARCH_WORKFLOWS_ONLY")
                self.assertEqual(report["permissions"]["contents"], "read")
                self.assertFalse(report["releaseAuthorized"])
                self.assertFalse(report["mayPublish"])
                self.assertFalse(report["humanApprovalGranted"])
                self.assertEqual(len(report["sha256"]), 64)

    def test_version_label_bump_cannot_override_read_only_policy(self):
        p = WORKFLOWS[0]
        original = self.originals[p]
        old = "name: EvidenceMotion actual 7-OH word-ASR research"
        self.assertIn(old, original)
        modified = original.replace(old, old + " v9", 1)
        result = inspect(p, modified)
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["releaseAuthorized"])
        self.assertEqual(result["permissions"]["contents"], "read")

    def test_untrusted_workflow_filename_or_empty_document_holds(self):
        for path, content in [
            ("unrelated.yml", self.originals[WORKFLOWS[0]]),
            (WORKFLOWS[0], ""),
        ]:
            with self.assertRaises(ResearchReleaseHold):
                inspect(path, content)

    def test_push_schedule_target_and_dispatch_only_regressions_hold(self):
        p = WORKFLOWS[0]
        original = self.originals[p]
        for snippet in (
            "  push:\n    branches: [main]\n",
            "  schedule:\n    - cron: '0 * * * *'\n",
            "  pull_request_target:\n    types: [opened]\n",
        ):
            with self.subTest(snippet=snippet):
                mutated = original.replace("on:\n", "on:\n" + snippet, 1)
                with self.assertRaisesRegex(ResearchReleaseHold, "TRIGGER"):
                    inspect(p, mutated)
        only_dispatch = original.replace("  pull_request:\n", "  workflow_dispatch:\n", 1)
        with self.assertRaises(ResearchReleaseHold):
            inspect(p, only_dispatch)

    def test_write_token_or_job_permission_override_holds(self):
        p = WORKFLOWS[0]
        original = self.originals[p]
        for mutation in (
            original.replace("  contents: read", "  contents: write", 1),
            original.replace("  actions: read", "  id-token: write", 1),
            original.replace("  actions: read", "  actions: write", 1),
            original.replace("    runs-on: ubuntu-latest",
                             "    permissions:\n      contents: write\n    runs-on: ubuntu-latest", 1),
        ):
            with self.assertRaises(ResearchReleaseHold):
                inspect(p, mutation)

    def test_deployment_and_secret_mutations_hold(self):
        p = WORKFLOWS[0]
        original = self.originals[p]
        anchor = "    runs-on: ubuntu-latest"
        self.assertIn(anchor, original)
        for insertion in (
            "    environment: production\n",
            "    secrets: inherit\n",
            "    steps:\n      - uses: cloudflare/wrangler-action@v3\n",
            "    steps:\n      - run: gh release create v9\n",
            "    steps:\n      - run: npm publish\n",
            "    steps:\n      - run: echo secrets.PUBLISH_TOKEN\n",
        ):
            with self.subTest(insertion=insertion):
                with self.assertRaises(ResearchReleaseHold):
                    inspect(p, original.replace(anchor, insertion + anchor, 1))

    def test_duplicate_keys_and_event_layout_holds(self):
        p = WORKFLOWS[0]
        original = self.originals[p]
        for mutated in (
            original.replace("permissions:\n",
                             "on:\n  workflow_dispatch:\npermissions:\n", 1),
            original.replace("  pull_request:\n",
                             "  pull_request: [opened]\n", 1),
            original.replace("permissions:\n",
                             "permissions: {contents: write}\n", 1),
        ):
            with self.assertRaises(ResearchReleaseHold):
                inspect(p, mutated)

    def test_comments_do_not_create_new_authority_or_false_alarm(self):
        p = WORKFLOWS[0]
        original = self.originals[p]
        safe = original.replace("jobs:\n",
                                "jobs:\n  # gh release create and secrets.DO_NOT_USE prohibited\n", 1)
        self.assertEqual(inspect(p, safe)["triggers"], inspect(p, original)["triggers"])


if __name__ == "__main__":
    unittest.main()
