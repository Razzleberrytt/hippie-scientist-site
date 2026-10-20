# Lane 3 merge review repairs - October 17, 2026

User authorized merging all current EvidenceMotion lanes. This follow-up addresses
both automated review findings on PR #6831, preserving research-only publication
and independent science, voice, craft and handset holds.

- Intro-label renderer: encode and validate in a private temporary directory on
  the destination filesystem. Publish with os.link, which refuses an existing
  destination atomically. Never unlink a destination belonging to another writer.
  The temporary context cleans only owned staging files. No fallback overwrites.
- Previz repetition: reject whitespace-padded source/claim identifiers through
  the existing uniqueIds validator. This prevents aliases bypassing repeated-shot
  detection; no new artistic positive or scientific approval is granted.

Observed red checks: concurrent-render failure deleted another writer's file
(FileNotFoundError); concurrent publication did not refuse an existing output
(assertion failure); whitespace alias sequence returned SEQUENCE_REVIEW_REQUIRED
instead of HOLD (assertion failure).

Fresh focused validation after repair:

- Windows Python 3.14: python -B -m unittest discover -s research/evidencemotion-director/lane3 -p test_intro_science_label_research.py -v: 9/9 PASS, no skips, exit0.
- Linux Python 3.12: same command: 9/9 PASS, no skips, exit0.
- node --test research/evidencemotion-director/previz-director.test.mjs: 20/20 PASS, no skips, exit0.

The existing reusable-director workflow already discovers every Lane3 Python test
and executes the Node previz suite. Full exact-head CI/build and controller gates
remain required. Synthetic file-safety fixtures mock media validation explicitly;
they are not physical original-film, source science, visual or release receipts.
Hard-link publication requires filesystem support and fails rather than weakening
no-overwrite semantics on an unsupported filesystem. No immutable film rewritten.


## Shot 5 concurrent-output follow-up

The same unconditional failure cleanup existed in shot5_mobile_safe_research.py.
New synthetic output-ownership tests reproduced deletion of concurrently created
overlay/movie files and a missed film publication collision. Encode both outputs
in private staging on each destination filesystem, then publish using no-clobber
hard links. Never unlink public destinations during failure cleanup; temporary
contexts clean only their owned staging files. If overlay publication succeeds
and movie publication collides, that invocation's own overlay may remain; this
is not an atomic two-file transaction, and no success receipt is emitted.

Windows pinned visual Python: 3/3 output-ownership tests PASS, no skips, exit0.
Linux isolated visual Python: complete Shot5 suite 9/9 PASS, no skips, exit0.
Tests mock media generation explicitly; no new real-film or creative approval.
Original source pixels, font pins, edited frame interval and audio-copy commands
remain unchanged. Fresh hosted Lane3 suite and full CI/build remain required.
