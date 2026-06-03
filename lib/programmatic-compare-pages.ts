import { buildCanonicalCompareRoute } from '@/lib/canonical-route-taxonomy'
import { text } from '@/lib/display-utils'

function title(value: unknown) {
  return text(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function buildProgrammaticComparePage(left: string, right: string) {
  return {
    slug: `${left}-vs-${right}`,
    href: buildCanonicalCompareRoute(left, right),
    title: `${title(left)} vs ${title(right)}`,
    description: `Compare ${title(left)} and ${title(right)} across evidence, mechanisms, practical fit, timing, stack compatibility, and realistic expectations.`,
  }
}

export function buildPriorityComparePages() {
  return [
    buildProgrammaticComparePage('magnesium-glycinate', 'magnesium-citrate'),
    buildProgrammaticComparePage('rhodiola', 'ashwagandha'),
    buildProgrammaticComparePage('alpha-gpc', 'citicoline'),
    buildProgrammaticComparePage('lions-mane', 'bacopa'),
    buildProgrammaticComparePage('glycine', 'theanine'),
  ]
}
