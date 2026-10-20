# EvidenceMotion video companion articles — **staged, NOT PUBLISHED**

Five candidate full-length science explainers are stored directly in this review-only directory as `evidencemotion-companions--*.md` files rather than in `content/articles/` to prevent static export and public routing before a separately authorized editorial release. Each has its original publish-ready source frontmatter for controlled promotion. **Do not tell readers any linked future article URL is currently live based on the existence of these files.**

## Owner request / why this exists
On October 13, 2026, the owner requested articles to accompany the five selected video topics, in plain English for a non-specialist audience. This bundle preserves the finished draft content and evidence source lists. Related EvidenceMotion video research: PR #6758.

## Five reviewed draft files
1. `evidencemotion-companions--dmt-types-explained.md` — DMT family and distinctions
2. `evidencemotion-companions--long-term-cannabis-brain-effects.md` — THC exposure, tolerance, cognition and recovery
3. `evidencemotion-companions--adhd-brain-facts-explained.md` — time, working memory, rewards, focus, initiating tasks
4. `evidencemotion-companions--yopo-bufotenine-science-history.md` — ethnobotany and bufotenine
5. `evidencemotion-companions--psychedelics-and-the-brain-science.md` — functional brain-network changes vs structural neuroplasticity

## 2026-10-13 adopted plain-language editorial gate

Use the repository's new canonical [plain-language science editorial standard](../../../docs/PLAIN_LANGUAGE_SCIENCE_EDITORIAL_STANDARD.md) when evaluating **each** of these five drafts. Its order is: ordinary-language answer → accurate technical name and first-use definition → concrete example → what a study measured → what is not established. A glossary or word-count check alone cannot establish that a beginner understands the article.

**Additional acceptance evidence required before promoting a draft to a live article:**
- A lay reader can restate the key claim in their own words, without being forced to look up chemistry or neuroscience vocabulary.
- The editor can identify source-grounded claims, participants, comparison, duration, reported negative/null findings and funding conflicts where relevant.
- The article explains PMID (the PubMed paper identifier), DOI (a permanent publication identifier), and specialized brain-scan/receptor vocabulary in context where displayed for readers.
- The linked video must undergo its own audio-first script check, on-phone caption/readability review, scientific accuracy pass and owner approval. A page being cleared does not automatically clear the video.
- Treat the draft metadata as preparation dates. Assign actual publication/update dates only in the authorized live-promotion PR.

**Current limited review proof:** All five have FAQ sections, linked papers and first-use examples. Solo source and accessibility review is documented in the PR discussion. **There is no independent audience-comprehension session or qualified scientific approval recorded yet.** This content remains outside public article collections.

---

## Release blockers / requirements
- **Admission:** Per `AGENTS.md` and `docs/CURRENT_SPRINT.md`, Authority/Content is occupied by #6749. This article bundle is review-only until the existing owner completes or the owner-approved project controller separately admits a non-overlapping article-publication ticket. Do not create a silent fourth workstream or overwrite active A ownership.
- **Science and editorial:** independently verify references and important claims, including negative/null findings and funding disclosures. All five currently carry source lists but no human clinical publication sign-off is implied.
- **Code:** Once admitted, promote files into `content/articles/` through a **separate** narrow PR. Preserve slugs/links, run the article quality gate, `npm run check`, production static build, sitemap/robots/canonical + mobile/light/dark checks. Match latest-head CI, resolve all review threads and use the sole release controller.
- **Production:** Get matching production-build/Cloudflare deployment receipt and inspect all five public routes. Neither a content branch nor a green PR proves the pages live.
- **Date:** Set actual publication date on live promotion rather than implying the draft was already published on 2026-10-13.

## Review resolution log
- Original PR #6761 Codex **P1**: immediate static publication without admission — fixed by relocating all files outside publishable content collections.
- Codex **P2**: 2022 positive depression trial lacked population, comparator, endpoints and funding — added controlled trial context and COMPASS Pathfinder funding disclosure in the psychedelic-brain draft.
- Codex **P2**: inaccurate generic research-paper author labels — replaced with checked author names and PMIDs in DMT, ADHD and yopo drafts.
- Open science/source checks and release proofs should be reviewed on the exact new commit, not retroactively marked passed.

The files are located directly within `ops/editorial-runtime/publication-pilots/` to use the existing, expressly approved **docs-only staging rule** in `scripts/ci/classify-release-impact.mjs`. They cannot affect built output or live pages. Full scientific, editorial, publication, release-controller and future live build gates still apply once separately admitted. This staging is an integrity safeguard, **not** a withdrawal of the owner's request to publish all five articles.
