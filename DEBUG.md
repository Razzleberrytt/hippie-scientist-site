# Debug Guide

## Basic check

When something breaks, check GitHub Actions first:

Repo → Actions → latest failed run

## Common problems

### Build failed
Check whether the error mentions:
- missing file
- TypeScript error
- lint error
- data build error

### Data failed
Check whether the workbook exists and generated data files are created.

### Deploy failed
Check:
- Cloudflare Pages settings
- Wrangler project name
- GitHub repository secrets
- `.vercel/output/static`

## Safe release checklist

Before changing the live site:
- homepage works
- herbs page works
- compounds page works
- sitemap works
- deploy action passes
