# Lane 4 integration repair: explicitly square sample pixels

Scope: existing research-only EvidenceMotion #6743, PR #6845. User requested all
remaining lane merges on October 17. No new normal implementation workstream.

Hosted original-WAV pipeline run 39040611417 failed during real preview production
with `PHONE_UI_HOLD:EXPECTED_SQUARE_VIDEO_SAMPLE_PIXELS`. The stricter Lane 4 audit
correctly rejects an unknown SAR; the existing raw-RGB renderer command left SAR
unspecified. Keep that audit unchanged. Extract its existing command into
`encoder_command` and explicitly encode `-vf setsar=1`, preserving dimensions,
frame rate, source WAV, audio filter, captions, science source, and existing holds.
Encoded output identity changes and requires new exact-film review.

Regression: actually feed 30 tiny synthetic RGB frames and a generated WAV through
the same command used by render(). Independent FFprobe initially reports no
sample_aspect_ratio; the new test fails (1 test, exit1). With setsar=1, FFprobe
reports 1:1 and the exact physical MP4 passes probe_movie. No fake film receipt.

Validation commands from repository root:

- Windows pinned visual Python 3.12.14: `python -B -m unittest discover -s research/evidencemotion-director -p test_narration_locked_treatments.py -v`
  with THS_TEST_FONT_DIR pointing at pinned visual fonts: 16/16 PASS, exit0, 5.833s.
- Linux isolated Python 3.12: same command: 16/16 PASS, exit0, 5.774s.
- Linux phone-audit suite is checked separately before push; hosted full CI,
  production build, real original-WAV pipeline, review and controller merge remain
  required at the resulting head. Tiny synthetic media is no original film proof.

This integration preserves `mayPublish=false`, research HOLD, independent science,
voice, craft, physical handset and publication review boundaries. No acceptance
score increases and no changes to previously delivered immutable artifacts.

Linux phone-audit suite: 186/186 PASS, no skips, exit0 (24.787s).
