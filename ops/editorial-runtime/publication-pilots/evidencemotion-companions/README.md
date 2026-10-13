# EvidenceMotion video companion articles — **staged, NOT PUBLISHED**

Five candidate full-length science explainers are held here rather than in `content/articles/` to prevent static export and public routing before a separately authorized editorial release. Each has its original publish-ready source frontmatter for controlled promotion. **Do not tell readers any linked future article URL is currently live based on the existence of these files.**

## Owner request / why this exists
On October 13, 2026, the owner requested articles to accompany the five selected video topics, in plain English for a non-specialist audience. This bundle preserves the finished draft content and evidence source lists. Related EvidenceMotion video research: PR #6758.

## Five reviewed draft files
1. `dmt-types-explained.md` — DMT family and distinctions
2. `long-term-cannabis-brain-effects.md` — THC exposure, tolerance, cognition and recovery
3. `adhd-brain-facts-explained.md` — time, working memory, rewards, focus, initiating tasks
4. `yopo-bufotenine-science-history.md` — ethnobotany and bufotenine
5. `psychedelics-and-the-brain-science.md` — functional brain-network changes vs structural neuroplasticity

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

This staging is an integrity safeguard, **not** a withdrawal of the owner's request to publish all five articles.
