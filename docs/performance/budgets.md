# Performance Budgets and Payload Guidelines

This document outlines the performance budgets established to keep "The Hippie Scientist" fast, lightweight, and efficient for mobile and low-bandwidth users. Since the site is fully statically exported, bundle and JSON payload sizes are critical to the user experience.

## Budget Targets

The build pipeline enforces size limits using `scripts/report-performance-budget.mjs`. If a target is exceeded by more than **10%**, the post-build CI validation step will fail.

| Metric | Target Budget | Description |
| :--- | :--- | :--- |
| **Max Single JSON File** | `2.5 MB` | The absolute maximum size for any individual JSON database file under `public/data/` (e.g. `compounds.json`, `herbs.json`). |
| **Search Index Payload** | `1.0 MB` | The limit for the client-side search index (`search-index.json`). |
| **Total Indexing Payload** | `2.0 MB` | The combined limit of the search index and summary JSONs (`herbs-summary.json` + `compounds-summary.json`) that are loaded on listing/search hubs. |
| **Next.js Core JS Bundle** | `350 KB` | The combined size of Next.js core client bundles (`main`, `framework`, `webpack`, and `polyfills`). |

## Lazy Loading and Optimization Guidelines

To keep the page load times minimal and avoid loading heavy payloads upfront, apply the following design patterns:

### 1. Eager vs. Lazy Loading of Search Data
- **Never eagerly import or fetch full JSON files** on the initial page load of general article or landing pages.
- Large data indices (such as the complete search index or large list datasets) should only be loaded dynamically on user interaction (e.g., when the user focuses the search input or clicks a search button).
- Use dynamic imports for search components or dynamic `fetch` calls for static JSON files.

### 2. Summary Payloads vs. Full Payloads
- Page hubs (like `/herbs` or `/compounds`) should load **summary payload files** (`herbs-summary.json` / `compounds-summary.json`) instead of full detail payloads (`herbs.json` / `compounds.json`).
- Summary payloads only contain fields required for indexing, rendering previews, and listing (e.g., `name`, `slug`, `category`, brief description). All detail fields (such as deep evidence logs or detailed safety texts) must be kept inside the individual detail JSON files.

### 3. Client Bundle Auditing
- Run the performance budget check locally after building:
  ```bash
  npm run build
  node scripts/report-performance-budget.mjs
  ```
- This will output a budget comparison table and write the latest measurements to [docs/performance/budgets-log.md](file:///c:/Users/Will/Documents/hippie-scientist-site/docs/performance/budgets-log.md).
