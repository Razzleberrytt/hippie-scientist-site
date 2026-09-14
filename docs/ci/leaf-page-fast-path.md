# Leaf-page CI fast path

A pull request qualifies for the leaf-page fast path only when every changed file is a nested Next.js App Router `app/**/page.*` file. Mixed changes fail closed to the exhaustive validation lanes.

The fast path removes duplicate heavyweight work; it does not remove page validation. Standard CI still runs lint, typecheck, tests/accessibility, production build, output verification, SEO reporting, indexability, redirects, and route SEO. Scoped claim-drift, Fast UI, schema/structured-data, crawl, and SEO workflows continue to run when their path triggers match.

For qualifying leaf-page PRs:

- Site Health remains green as a canonical workflow but delegates exhaustive `check:full` to standard CI.
- Atomic upgrade gate still enforces the issue/measurement contract but skips duplicate `validate:release`.
- Production Content Invariants reuses the governed data corpus already committed on `main`, while still building production HTML and auditing visible language and robots behavior.
- Schema and Media Governance keeps schema regression/build/structured-data/safety validation while skipping unrelated research-graphics generation and promotion-registry checks.

Any root page, layout, route handler, shared component/library, runtime data, content pipeline, generator, package/config, or mixed diff disables the fast path automatically.
