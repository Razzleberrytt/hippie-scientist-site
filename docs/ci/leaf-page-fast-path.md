# Leaf-page CI fast path

A pull request qualifies for the leaf-page fast path only when every changed file is a **deep static editorial leaf** under the Next.js App Router (`app/**/page.*`). The classifier requires at least two concrete URL segments below `app/` and fails closed for dynamic/catch-all pages, route-group roots, shallow category/index hubs, parallel routes, intercepting routes, private folders, and mixed changes.

The fast path removes duplicate heavyweight work; it does not remove page validation. Standard CI still runs lint, typecheck, tests/accessibility, production build, output verification, SEO reporting, indexability, redirects, and route SEO. Scoped claim-drift, Fast UI, schema/structured-data, crawl, and SEO workflows continue to run when their path triggers match.

For qualifying leaf-page PRs:

- Site Health remains green as a canonical workflow but delegates exhaustive `check:full` to standard CI.
- Atomic upgrade gate still enforces the issue/measurement contract but skips duplicate `validate:release`.
- Production Content Invariants reuses the governed data corpus already committed on `main`, while still building production HTML and auditing visible language and robots behavior.
- Schema and Media Governance keeps schema regression/build/structured-data/safety validation while skipping unrelated research-graphics generation and promotion-registry checks.

The fast path is deliberately unavailable for:

- `app/page.*` and route-group roots such as `app/(marketing)/page.tsx`;
- shallow hubs such as `app/guides/page.tsx`;
- dynamic or catch-all implementations such as `[slug]`, `[...slug]`, and `[[...slug]]`;
- parallel, intercepting, or private routing shapes (`@slot`, `(.)route`, `_private`);
- layouts, route handlers, metadata/sitemap generators, shared components/libraries, runtime data, content pipelines, package/config changes, or any mixed diff.

Those changes continue through the exhaustive validation lanes automatically.
