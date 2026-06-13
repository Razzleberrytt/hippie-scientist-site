# Dependency and Toolchain Policy

To maintain long-term build reliability and avoid regressions in the static export output, all dependency updates must follow the guidelines detailed below.

## Policy Rules

1. **Controlled Framework Upgrades**:
   - Do **not** upgrade the Next.js or React major version without a dedicated branch, thorough verification, and explicit authorization.
   - Any upgrade to critical routing or bundler packages must be validated against the static export output (`npm run verify:build`) to ensure no dynamic server dependencies are introduced.

2. **Grouped Updates**:
   - Package updates should be grouped logically (e.g., separating testing utilities from core UI elements) to make pull request reviews and regression tracing straightforward.
   - Use Dependabot to automatically track and suggest grouped dependency upgrades.

3. **Validation Requirements**:
   - Every package upgrade must pass the full verification suite:
     ```bash
     npm ci
     npm run verify:build
     npm run test
     ```

## Known Upgrade Risks

| Dependency / Ecosystem | Risk Level | Description & Mitigation |
| :--- | :--- | :--- |
| **Next.js & React (v15+ / v18-v19)** | **High** | React 19 introduces strict typing changes and element reference shifts. Next.js major upgrades often modify static export configurations, routing boundaries, or default caching. Do not perform major updates on these without an isolated testing branch. |
| **Wrangler / Cloudflare Pages** | **Medium** | Wrangler updates can introduce changes to Cloudflare Pages Functions local emulation (e.g., KV bindings, request object properties, or routing behaviors). Test the API endpoints locally using wrangler emulator after any update. |
| **ExcelJS & Data Pipelines** | **Medium** | ExcelJS is used in `scripts/data/` to compile the spreadsheet into the public JSON files. A version upgrade could alter sheet parsing or cells extraction rules, breaking data exports. Verify the output of `npm run data:build` carefully before committing. |
| **UI & Animation (Framer Motion, Lucide)** | **Low** | Watch out for breaking changes in CSS variables support or animation hooks. Verify all visual components via a local dev server before merging. |
