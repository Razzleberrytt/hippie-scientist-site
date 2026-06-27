# Blog Title & Slug Audit

Date: 2026-03-25  
Scope: active public posts from `content/blog` (`draft: true` excluded)

## Audit summary

- Initial active posts audited: 51
- Final active posts after cleanup: 48
- Exact duplicate active titles found: 1 pair
- Near-duplicate active titles found: 2 pairs
- Exact duplicate active slugs found: 0
- Ambiguous active slugs requiring rename: 0

## Actions taken

| old title                                       | new title | old slug                                               | new slug | status                   |
| ----------------------------------------------- | --------- | ------------------------------------------------------ | -------- | ------------------------ |
| Blend Craft — Reishi (Saturday Notes)           | —         | 2025-08-30-blend-craft-reishi-saturday-notes           | —        | excluded (`draft: true`) |
| Pharmacology Basics — Rhodiola (Saturday Notes) | —         | 2025-09-06-pharmacology-basics-rhodiola-saturday-notes | —        | excluded (`draft: true`) |
| Bioassays — Blue Lotus (Thursday Notes)         | —         | 2025-09-04-bioassays-blue-lotus-thursday-notes         | —        | excluded (`draft: true`) |

## Notes

- All remaining active titles are unique after exclusions.
- All remaining active slugs are unique.
- Slug generation now validates duplicate titles/slugs in the build pipeline and warns on near-duplicate title patterns.
