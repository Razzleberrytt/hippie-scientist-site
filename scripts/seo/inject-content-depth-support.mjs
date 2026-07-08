import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const marker = 'data-content-depth-support="true"'

function* walkHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_next' || entry.name === 'pagefind') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkHtmlFiles(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield fullPath
    }
  }
}

function routeFromFile(filePath) {
  const rel = path.relative(outDir, filePath).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '/')}`.replace(/\/+/g, '/')
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function extractFirst(html, regex) {
  const match = html.match(regex)
  return match ? decodeEntities(match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()) : ''
}

function getPageTitle(html, route) {
  return (
    extractFirst(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s*\|\s*The Hippie Scientist\s*$/i, '') ||
    route.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ||
    'this page'
  )
}

function getMetaDescription(html) {
  return extractFirst(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i)
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function paragraph(text) {
  return `<p>${escapeHtml(text)}</p>`
}

function buildBlock({ title, eyebrow, paragraphs, links = [] }) {
  const linkList = links.length
    ? `<ul>${links.map((link) => `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`).join('')}</ul>`
    : ''

  return `
<section ${marker} class="content-depth-support" aria-label="Additional editorial context">
  <div class="content-depth-support__inner">
    <p class="content-depth-support__eyebrow">${escapeHtml(eyebrow)}</p>
    <h2>${escapeHtml(title)}</h2>
    ${paragraphs.map(paragraph).join('\n    ')}
    ${linkList}
  </div>
</section>`
}

function routeFamily(route) {
  if (route === '/') return 'home'
  if (/^\/herbs\/page\/\d+\/?$/.test(route)) return 'herb-index'
  if (route === '/herbs/' || route.startsWith('/herbs/')) return 'herb'
  if (/^\/compounds\/page\/\d+\/?$/.test(route)) return 'compound-index'
  if (route === '/compounds/' || route.startsWith('/compounds/')) return 'compound'
  if (route.startsWith('/guides/compare/')) return 'compare'
  if (route.startsWith('/guides/')) return 'guide'
  if (route.startsWith('/learn/')) return 'learn'
  if (route.startsWith('/articles/')) return 'article'
  if (route.startsWith('/novel-psychoactive-substances/')) return 'harm-reduction'
  if (route.startsWith('/info/')) return 'info'
  if (route === '/safety-checker/') return 'safety'
  if (route === '/search/') return 'search'
  if (route.startsWith('/evidence/')) return 'evidence'
  return null
}

function supportCopy(family, title, description) {
  const pageName = title || 'this page'
  const summary = description || `${pageName} is part of The Hippie Scientist evidence library.`

  switch (family) {
    case 'home':
      return buildBlock({
        eyebrow: 'How to use this library',
        title: 'Evidence-first supplement research, not hype',
        paragraphs: [
          'The Hippie Scientist is organized around practical questions: sleep, stress, anxiety, focus, safety, dosing, and product quality. Start with the goal that matches your situation, then use the herb and compound profiles to compare evidence strength, mechanism plausibility, and safety tradeoffs before buying anything.',
          'Each page is written to separate what is known from what is only mechanistically plausible. The goal is not to make every ingredient sound useful; it is to help you narrow choices, avoid unnecessary stacks, and understand when a supplement question belongs with a clinician or pharmacist.',
        ],
        links: [
          { label: 'Browse herb profiles', href: '/herbs/' },
          { label: 'Browse compound profiles', href: '/compounds/' },
          { label: 'Check supplement safety', href: '/safety-checker/' },
        ],
      })
    case 'herb-index':
    case 'herb':
      return buildBlock({
        eyebrow: 'Botanical profile context',
        title: `How to interpret ${pageName}`,
        paragraphs: [
          `${summary} Use this herb profile as a starting point for evidence review, not as a recommendation to start a new supplement. Botanical products can vary by plant part, extract ratio, standardization, dose, and contaminant testing, so two labels with the same common name may not behave the same way.`,
          `When reviewing ${pageName}, compare the traditional-use context against the human evidence, mechanism notes, and safety cautions. Pay special attention to pregnancy, breastfeeding, liver or kidney disease, blood-pressure effects, sedation, stimulation, anticoagulant use, antidepressants, and any prescription medication overlap.`,
          'For product decisions, prefer transparent labels, named extracts, clear serving sizes, and third-party quality testing. Avoid treating a long list of possible mechanisms as proof that an herb will solve a specific condition.',
        ],
        links: [
          { label: 'Browse all herbs', href: '/herbs/' },
          { label: 'Use the safety checker', href: '/safety-checker/' },
          { label: 'Learn product quality basics', href: '/learn/product-quality/' },
        ],
      })
    case 'compound-index':
    case 'compound':
      return buildBlock({
        eyebrow: 'Compound profile context',
        title: `How to interpret ${pageName}`,
        paragraphs: [
          `${summary} Use this compound profile to understand mechanism, evidence quality, and practical safety context before comparing products or building a stack. A biochemical pathway connection can be useful for discovery, but it is not the same as proven benefit in humans.`,
          `When reviewing ${pageName}, separate the active molecule from the product category around it. Dose form, absorption, extract standardization, medication interactions, and individual sensitivity can change the real-world risk-benefit picture.`,
          'For supplement planning, avoid combining multiple compounds with overlapping sedating, stimulating, serotonergic, blood-pressure, anticoagulant, or liver-metabolism effects unless a qualified clinician has reviewed the context.',
        ],
        links: [
          { label: 'Browse all compounds', href: '/compounds/' },
          { label: 'Compare safety interactions', href: '/safety-checker/' },
          { label: 'Review dosing concepts', href: '/info/dosing/' },
        ],
      })
    case 'compare':
      return buildBlock({
        eyebrow: 'Comparison guide context',
        title: `How to use ${pageName}`,
        paragraphs: [
          `${summary} Comparison pages are meant to clarify tradeoffs, not declare one ingredient universally better. The better choice depends on the goal, evidence quality, safety profile, dose realism, and whether the ingredient duplicates something already in a stack.`,
          `Read ${pageName} by looking for differences in mechanism, onset, tolerability, interaction risk, and product quality. A stronger evidence rating for one use case does not automatically transfer to another goal.`,
          'If both options influence the same pathway, consider simplifying rather than stacking. Reducing overlap often makes side effects easier to identify and decisions easier to reverse.',
        ],
        links: [
          { label: 'Browse compare guides', href: '/guides/compare/' },
          { label: 'Check stack safety', href: '/safety-checker/' },
        ],
      })
    case 'guide':
    case 'article':
    case 'harm-reduction':
      return buildBlock({
        eyebrow: 'Editorial reading context',
        title: `How to read ${pageName}`,
        paragraphs: [
          `${summary} This guide is intended to help readers make sense of evidence, safety, and practical fit without turning supplement research into a one-size-fits-all checklist. Use it alongside the linked herb and compound profiles for deeper mechanism and safety details.`,
          `For ${pageName}, focus on whether the evidence matches the exact outcome you care about, whether the dose discussed is realistic, and whether the safety profile fits your medical context. Strong marketing language should carry less weight than human evidence and transparent product quality.`,
          'When a page discusses dependence-forming substances, restricted compounds, or high-risk contexts, treat it as harm-reduction education only. It is not a buying guide, dosing instruction, or substitute for professional care.',
        ],
        links: [
          { label: 'Browse guides', href: '/guides/' },
          { label: 'Search the library', href: '/search/' },
        ],
      })
    case 'learn':
    case 'evidence':
      return buildBlock({
        eyebrow: 'Learning context',
        title: `How this concept connects to supplement decisions`,
        paragraphs: [
          `${summary} Learning pages explain the reasoning layer behind the herb and compound library. They are designed to make mechanisms, evidence quality, safety tradeoffs, and product claims easier to interpret.`,
          `Use ${pageName} to build better questions before choosing a supplement: what outcome is being targeted, what mechanism is claimed, what human evidence exists, what dose was studied, and what risks could change the answer for a specific person?`,
          'Mechanistic plausibility is useful, but it should be weighed against trial design, safety history, product quality, and the possibility that a simpler intervention may be more appropriate.',
        ],
        links: [
          { label: 'Evidence checker', href: '/evidence/evidence-checker/' },
          { label: 'Product quality guide', href: '/learn/product-quality/' },
        ],
      })
    case 'info':
    case 'safety':
    case 'search':
      return buildBlock({
        eyebrow: 'Tool context',
        title: `How to use ${pageName}`,
        paragraphs: [
          `${summary} Tool and utility pages are meant to support research decisions, not replace the full evidence review. Use the results as a triage layer that points you toward the profile, guide, or safety topic that deserves closer reading.`,
          `For ${pageName}, the most useful approach is conservative: check one question at a time, compare the result against the full profile, and avoid assuming that an automated output proves safety, effectiveness, or correct dosing.`,
          'If the question involves prescription medications, pregnancy, breastfeeding, chronic disease, surgery, addiction risk, or a child, the next step should include a clinician or pharmacist rather than relying only on a supplement website.',
        ],
        links: [
          { label: 'Safety checker', href: '/safety-checker/' },
          { label: 'Dosing calculator', href: '/info/dosing/' },
          { label: 'Search the site', href: '/search/' },
        ],
      })
    default:
      return null
  }
}

function injectBeforeMainEnd(html, block) {
  if (html.includes(marker)) return html

  const mainClose = html.lastIndexOf('</main>')
  if (mainClose !== -1) {
    return `${html.slice(0, mainClose)}${block}\n${html.slice(mainClose)}`
  }

  const bodyClose = html.lastIndexOf('</body>')
  if (bodyClose !== -1) {
    return `${html.slice(0, bodyClose)}${block}\n${html.slice(bodyClose)}`
  }

  return html
}

if (!fs.existsSync(outDir)) {
  console.warn('[content-depth-support] out directory not found; skipping.')
  process.exit(0)
}

let touched = 0

for (const filePath of walkHtmlFiles(outDir)) {
  const route = routeFromFile(filePath)
  const family = routeFamily(route)
  if (!family) continue

  const html = fs.readFileSync(filePath, 'utf8')
  if (html.includes(marker)) continue

  const title = getPageTitle(html, route)
  const description = getMetaDescription(html)
  const block = supportCopy(family, title, description)
  if (!block) continue

  const next = injectBeforeMainEnd(html, block)
  if (next !== html) {
    fs.writeFileSync(filePath, next)
    touched += 1
  }
}

console.log(`[content-depth-support] Added route-aware supporting copy to ${touched} exported HTML pages.`)
