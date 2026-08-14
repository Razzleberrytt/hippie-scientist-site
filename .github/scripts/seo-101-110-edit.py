from pathlib import Path
import re


def read(path):
    return Path(path).read_text()


def write(path, text):
    Path(path).write_text(text)


def replace_first(path, old, new):
    text = read(path)
    if old not in text:
        raise SystemExit(f'{path}: missing expected text: {old[:100]!r}')
    write(path, text.replace(old, new, 1))


def replace_count(path, old, new, expected):
    text = read(path)
    count = text.count(old)
    if count != expected:
        raise SystemExit(f'{path}: expected {expected} matches, found {count}: {old[:100]!r}')
    write(path, text.replace(old, new))


def regex_once(path, pattern, replacement, flags=0):
    text = read(path)
    text2, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'{path}: regex expected one match, found {count}: {pattern[:100]!r}')
    write(path, text2)


def insert_before_first(path, marker, addition):
    text = read(path)
    if marker not in text:
        raise SystemExit(f'{path}: missing insertion marker: {marker[:100]!r}')
    write(path, text.replace(marker, addition + marker, 1))


# 101 — Creatine brain-health: calibrate YMYL claims, repair primary references, and remove duplicate comparison content.
creatine = 'app/guides/other/creatine-brain-health/page.tsx'
replace_first(
    creatine,
    "  title: 'Creatine for Brain Health: Beyond Muscle (2026 Evidence)',",
    "  title: 'Creatine for Brain Health: What Human Evidence Shows',",
)
replace_first(
    creatine,
    "  description: 'Creatine isn\\'t just for athletes. 8 cited studies on brain fog, menopause cognition, sleep deprivation, depression, and why 40+ women are taking it.',",
    "  description: 'Human evidence on creatine for memory, sleep deprivation, menopause, and depression—what looks promising, what remains uncertain, and where claims overreach.',",
)
regex_once(
    creatine,
    r"const FAQS = \[.*?\n\]\n\nconst CREATINE_BRAIN_REFS",
    '''const FAQS = [
  { question: 'Does creatine improve brain function?', answer: 'A 2024 meta-analysis of 16 randomized trials (492 adults) found modest benefits for memory, attention time, and processing speed, but not for overall cognition or executive function. Certainty was moderate for memory and low for several other outcomes, so the evidence is promising rather than universal.' },
  { question: 'What does the menopause trial show?', answer: 'A small randomized trial in 36 perimenopausal or postmenopausal women found that 1,500 mg/day creatine hydrochloride for 8 weeks improved reaction time and increased frontal brain creatine versus placebo. Mood-swing improvement was only a trend, and the trial does not establish a general treatment for menopause-related brain fog.' },
  { question: 'How much creatine has been studied for cognition?', answer: 'Study protocols vary. Most longer-term cognition research uses creatine monohydrate, while acute sleep-deprivation experiments have used unusually high single doses such as 0.35 g/kg and, in a 2026 follow-up, 0.2 g/kg. Those experimental doses should not be treated as a universal brain-health protocol.' },
  { question: 'Is creatine proven to protect the brain?', answer: 'No. Creatine is involved in cellular energy metabolism and has a substantial sports-nutrition safety literature, but current cognitive trials do not prove that it prevents dementia, protects every healthy brain, or produces noticeable benefits in every population.' },
  { question: 'Does creatine help with depression?', answer: 'Evidence is preliminary and mainly concerns creatine used alongside standard treatment. A 2012 randomized trial in women with major depression found faster improvement when creatine was added to an SSRI. That does not establish creatine as a standalone depression treatment.' },
]

const CREATINE_BRAIN_REFS''',
    flags=re.S,
)
replace_first(
    creatine,
    "{ n: 1, text: 'Xu C, et al. (2024). Creatine supplementation on cognitive function in adults: systematic review and meta-analysis. Front Nutr, 11: 1421486.', url: 'https://pubmed.ncbi.nlm.nih.gov/39131742/' },",
    "{ n: 1, text: 'Xu C, et al. (2024). The effects of creatine supplementation on cognitive function in adults: systematic review and meta-analysis. Front Nutr, 11:1424972. Sixteen RCTs / 492 participants.', url: 'https://pubmed.ncbi.nlm.nih.gov/39070254/' },",
)
replace_first(
    creatine,
    "{ n: 2, text: 'Gordji-Nejad A, et al. (2026). Single-dose creatine reduces sleep deprivation-induced cognitive deterioration. Nutrients, 18(3): 592.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },",
    "{ n: 2, text: 'Gordji-Nejad A, et al. (2026). Single-Dose Creatine Reduces Sleep Deprivation-Induced Deterioration in Cognitive Performance. Nutrients. Twenty-nine healthy participants; 0.2 g/kg single-dose crossover study.', url: 'https://pubmed.ncbi.nlm.nih.gov/42075005/' },",
)
replace_first(
    creatine,
    "{ n: 4, text: 'Korovljev D, et al. (2025). Creatine supplementation in perimenopausal women (CONCRET-MENOPA RCT). Nutrients.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },",
    "{ n: 4, text: 'Korovljev D, et al. (2025). CONCRET-MENOPA randomized controlled trial in perimenopausal and menopausal women. J Am Nutr Assoc. Epub 2025 Aug 25.', url: 'https://pubmed.ncbi.nlm.nih.gov/40854087/' },",
)
regex_once(
    creatine,
    r'<section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">.*?</p></section>',
    '''<section className="card-premium p-6 space-y-4"><p className="eyebrow-label">Evidence verdict</p><h2 className="text-2xl font-semibold">Creatine may help some cognitive outcomes, but the effect is not universal</h2><p className="text-sm leading-7 text-muted">The strongest broad synthesis here is a 2024 meta-analysis of 16 randomized trials / 492 adults. It found modest improvements in memory, attention time, and processing speed, but not overall cognition or executive function [1]. Sleep-deprivation studies provide a separate acute-stress signal [2], while the menopause trial is small and formulation-specific [4]. The useful conclusion is narrower than “creatine boosts the brain”: benefits appear outcome- and population-dependent, and several domains remain low-certainty.</p></section>''',
    flags=re.S,
)
regex_once(
    creatine,
    r'\n        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Use Case</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Effect Size</th><th className="text-left py-2 font-semibold text-ink">Dose</th></tr></thead>.*?</table></div>\n        <p className="text-xs leading-5 text-muted">Creatine works best.*?</p>',
    '',
    flags=re.S,
)

# 102 — Separate the broad natural-sleep and supplement-only SERP intents.
sleep_supp = 'app/guides/sleep/best-supplements-for-sleep/page.tsx'
replace_count(
    sleep_supp,
    "title: 'Best Sleep Supplements: What the Evidence Supports in 2026',",
    "title: 'Best Sleep Supplements: Evidence, Safety & Limits',",
    2,
)
replace_first(
    sleep_supp,
    "'Evidence-first comparison of melatonin, ashwagandha, L-theanine, magnesium, valerian, and passionflower for sleep, with directness, safety limits, and chronic-insomnia guidance.',",
    "'Compare melatonin, ashwagandha, L-theanine, magnesium, valerian, and passionflower specifically as sleep supplements, with evidence strength, safety limits, and insomnia context.',",
)
replace_first(
    sleep_supp,
    'headline="Best Sleep Supplements: What the Evidence Supports in 2026"',
    'headline="Best Sleep Supplements: Evidence, Safety & Limits"',
)
replace_first(
    sleep_supp,
    'Best Sleep Supplements: What the Evidence Supports in 2026\n            </h1>',
    'Best Sleep Supplements: Evidence, Safety & Limits\n            </h1>',
)

# 103 — Add an explicit above-fold scope handoff from the supplement page.
insert_before_first(
    sleep_supp,
    '            <figure className="mt-6">',
    '''            <div className="mt-5 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">
              <strong className="text-ink">This page is intentionally supplement-specific.</strong>{' '}
              If you are comparing light, routines, behavioral approaches, and nonprescription options together, use the{' '}
              <Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="font-semibold text-brand-700 hover:underline">
                natural sleep aids guide
              </Link>{' '}instead.
            </div>

''',
)

# 104 — Make the natural-aids page own the broader natural-sleep intent with a reciprocal handoff.
natural = 'app/guides/sleep/best-natural-sleep-aids-that-work/page.tsx'
replace_count(
    natural,
    "title: 'Best Natural Sleep Aids That Actually Work (Evidence-Based)',",
    "title: 'Natural Sleep Aids That Work: Evidence-Based Guide',",
    2,
)
replace_first(
    natural,
    "'Which natural sleep aids have human evidence? A cautious guide to melatonin, magnesium, L-theanine, valerian and passionflower — including where evidence is useful, limited or inconclusive.',",
    "'Evidence-based natural sleep guide covering sleep timing, foundational habits, melatonin, magnesium, L-theanine, valerian, and passionflower—plus where supplements fit.',",
)
replace_first(
    natural,
    'headline="Best Natural Sleep Aids That Actually Work"',
    'headline="Natural Sleep Aids That Work: Evidence-Based Guide"',
)
replace_first(
    natural,
    'Best Natural Sleep Aids That Actually Work\n          </h1>',
    'Natural Sleep Aids That Work: Evidence-Based Guide\n          </h1>',
)
insert_before_first(
    natural,
    '          <figure className="mt-6">',
    '''          <div className="mt-5 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">
            <strong className="text-ink">Use this broader guide when “natural sleep aid” includes more than a capsule.</strong>{' '}
            If you only want to compare supplement ingredients, go straight to{' '}
            <Link href="/guides/sleep/best-supplements-for-sleep/" className="font-semibold text-brand-700 hover:underline">
              the sleep-supplement comparison
            </Link>.
          </div>

''',
)

# 105 — Overthinking: clarify neighboring intents and add contextual crawl paths.
over = 'app/guides/anxiety/best-supplements-for-overthinking/page.tsx'
insert_before_first(
    over,
    '          <figure className="mt-6">',
    '''          <div className="mt-5 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">
            <strong className="text-ink">Intent check:</strong> this page is about repetitive thinking, not a cortisol test or a general insomnia ranking. For biomarker questions, see{' '}
            <Link href="/guides/anxiety/how-to-lower-cortisol-naturally/" className="font-semibold text-brand-700 hover:underline">the cortisol guide</Link>;
            for racing thoughts that mainly appear at bedtime, see{' '}
            <Link href="/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/" className="font-semibold text-brand-700 hover:underline">nighttime anxiety and herbs</Link>.
          </div>

''',
)

# 106 — Cortisol: separate a biomarker query from the stress-outcome query.
cortisol = 'app/guides/anxiety/how-to-lower-cortisol-naturally/page.tsx'
insert_before_first(
    cortisol,
    '          <figure className="mt-6">',
    '''          <div className="mt-5 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">
            <strong className="text-ink">Search-intent boundary:</strong> a lower cortisol result is not automatically the same thing as feeling less stressed. If your real question is which stress supplements have direct human outcome data, compare the{' '}
            <Link href="/guides/anxiety/best-adaptogens-for-stress/" className="font-semibold text-brand-700 hover:underline">adaptogen evidence guide</Link>.
          </div>

''',
)

# 107 — Adaptogens: route cortisol and bedtime queries to their dedicated pages.
adapt = 'app/guides/anxiety/best-adaptogens-for-stress/page.tsx'
insert_before_first(
    adapt,
    '          <figure className="mt-6">',
    '''          <div className="mt-5 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">
            <strong className="text-ink">Use this page for stress-outcome comparisons.</strong>{' '}
            For cortisol testing or “high cortisol” claims, use the{' '}
            <Link href="/guides/anxiety/how-to-lower-cortisol-naturally/" className="font-semibold text-brand-700 hover:underline">cortisol guide</Link>;
            for symptoms that mainly happen at bedtime, use the{' '}
            <Link href="/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/" className="font-semibold text-brand-700 hover:underline">nighttime guide</Link>.
          </div>

''',
)

# 108 — Nighttime anxiety: hand off insomnia-only intent to the dedicated sleep cluster.
night = 'app/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/page.tsx'
insert_before_first(
    night,
    '          <figure className="mt-6">',
    '''          <div className="mt-5 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">
            <strong className="text-ink">Is the main problem sleep rather than anxiety?</strong>{' '}
            Compare the broader{' '}
            <Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="font-semibold text-brand-700 hover:underline">natural sleep aids guide</Link>{' '}
            or the supplement-only{' '}
            <Link href="/guides/sleep/best-supplements-for-sleep/" className="font-semibold text-brand-700 hover:underline">sleep supplement guide</Link>.
          </div>

''',
)

# 109 — Push anxiety-hub authority into three high-intent stress targets.
anxiety_hub = 'app/guides/anxiety/page.tsx'
anchor = '''  {
    href: '/guides/anxiety/anxiety-stack-guide/',
    title: 'Anxiety Stack Guide',
    desc: 'How common combinations are discussed while keeping interactions, timing, and uncertainty visible.',
  },'''
expanded = anchor + '''
  {
    href: '/guides/anxiety/best-adaptogens-for-stress/',
    title: 'Best Adaptogens for Stress',
    desc: 'Direct human stress evidence, preparation-specific limits, and safety compared without HPA-axis shortcuts.',
  },
  {
    href: '/guides/anxiety/how-to-lower-cortisol-naturally/',
    title: 'How to Lower Cortisol Naturally',
    desc: 'Separate everyday stress management from medical cortisol excess, testing, and biomarker marketing.',
  },
  {
    href: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/',
    title: 'Herbs for Nighttime Stress & Anxiety',
    desc: 'Nighttime intent with same-night claims, repeated-dose evidence, sedation, and insomnia boundaries kept distinct.',
  },'''
replace_first(anxiety_hub, anchor, expanded)

# 110 — Verify both discoverable RSS endpoints in the exported artifact.
feed_validator = Path('scripts/ci/validate-feed-output.mjs')
if feed_validator.exists():
    raise SystemExit('scripts/ci/validate-feed-output.mjs already exists; refusing to overwrite')
feed_validator.write_text(r'''import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'out')
const EXPECTED = [
  { route: '/rss.xml', file: 'rss.xml' },
  { route: '/feed.xml', file: 'feed.xml' },
]

const failures = []
for (const expected of EXPECTED) {
  const filePath = path.join(OUT, expected.file)
  if (!fs.existsSync(filePath)) {
    failures.push(`${expected.route}: missing ${path.relative(ROOT, filePath)} after static export`)
    continue
  }

  const xml = fs.readFileSync(filePath, 'utf8')
  if (!xml.includes('<rss') || !xml.includes('<channel>')) {
    failures.push(`${expected.route}: exported file is not an RSS channel`)
  }
  if (!xml.includes('https://thehippiescientist.net/articles/')) {
    failures.push(`${expected.route}: canonical /articles/ channel URL is missing`)
  }
  if (!xml.includes(`<atom:link href="https://thehippiescientist.net${expected.route}" rel="self"`)) {
    failures.push(`${expected.route}: canonical Atom self link is missing or mismatched`)
  }
  if (!/<item>[\s\S]*?<guid[^>]*>https:\/\/thehippiescientist\.net\/.+?<\/guid>[\s\S]*?<\/item>/.test(xml)) {
    failures.push(`${expected.route}: no canonical absolute item GUID was found`)
  }
}

if (failures.length) {
  console.error('[validate-feed-output] FAIL')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[validate-feed-output] PASS: rss.xml and feed.xml are present and canonical')
''')

package = 'package.json'
replace_first(
    package,
    'node scripts/ci/validate-robots.mjs --require-built && npm run audit:sitemap-affiliate',
    'node scripts/ci/validate-robots.mjs --require-built && node scripts/ci/validate-feed-output.mjs && npm run audit:sitemap-affiliate',
)

print('Applied SEO upgrades 101-110')
