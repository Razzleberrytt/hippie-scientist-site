# Lane 5 merge review repairs - October 17, 2026

Existing research owner #6743, PR #6846; user authorized all lane merges. Addresses
three automated review findings without changing original media or approval gates.

1. Audio-only remaster: reuse finished_dual_delivery_guard.pcm to decode each
   complete AAC track at 24 kHz. Compare each sample count to its own video frame
   count and rational frame rate, within the existing 100 ms delivery tolerance.
   Container duration and loudness measurement do not prove narration coverage.
2. Dual delivery: independently compare master and mobile audio counts with each
   video's 30 fps timeline; matching truncated tracks cannot satisfy this check.
   Both reports disclose decoded sample counts and the 100 ms tolerance. Coverage
   measures duration, not lexical identity, silence, phonetic correctness or timing.
3. Localized visual repair: inventory every container stream before choosing v:0
   or a:0; require exactly one H264 video and one AAC audio. Extra or unsupported
   tracks remain unreviewed and fail closed rather than being silently ignored.

Red evidence: real FFmpeg 100 ms remaster prefix returned a receipt; master and
mobile with the same 150 ms AAC prefix returned a receipt; adding an extra audio
or video stream returned a localized-change receipt. Each new negative failed
before the implementation repair.

Fresh physical-fixture suites after repair, no external source substitutions:

- Windows Python 3.14: test_audio_only_remaster_guard.py: 11 PASS, one explicit
  symlink privilege SKIP (WinError 1314), exit0; test_finished_dual_delivery_guard.py:
  10/10 PASS; test_visual_scene_repair_guard.py: 7/7 PASS; all exits0.
- Linux Python 3.12: same three suites: 12/12, 10/10, 7/7 PASS, no skips, exits0.
- The existing operator-rehearsal workflow registers all six changed source/test
  paths and runs these suites. Exact resulting head still requires hosted full
  CI/build, independent review-thread resolution and sole-controller merge.

Only research guards, regressions and this evidence note change. No release,
science, voice, actual-handset, craft, first-excellent or render-streak approval;
mayPublish=false and existing research HOLD remain. Production deployment must
be evidenced independently of repository merge and synthetic-fixture execution.
