import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

const CENTRALIZED_JSON_LD_EMITTERS = [
  'app/layout.tsx',
  'components/BreadcrumbSchema.tsx',
  'components/NavigationSchema.tsx',
  'components/SchemaOrg.tsx',
  'components/seo/AuthorityJsonLd.tsx',
  'components/seo/FaqJsonLd.tsx',
  'components/seo/JsonLd.tsx',
  'src/components/ecosystem-supernode.tsx',
]

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
}

describe('central JSON-LD serialization boundary', () => {
  it.each(CENTRALIZED_JSON_LD_EMITTERS)(
    '%s does not directly stringify JSON-LD payloads',
    (relativePath) => {
      const source = read(relativePath)
      const directSerialization = /dangerouslySetInnerHTML\s*=\s*\{\{[\s\S]{0,180}?JSON\.stringify\s*\(/

      expect(source).not.toMatch(directSerialization)
    },
  )

  it('keeps the shared JsonLd component on the tested serializer', () => {
    const source = read('components/seo/JsonLd.tsx')

    expect(source).toContain("import { serializeJsonLd } from '@/src/lib/schema-injector'")
    expect(source).toContain('serializeJsonLd(schema)')
  })

  it('keeps ecosystem FAQ schema on the shared JsonLd component', () => {
    const source = read('src/components/ecosystem-supernode.tsx')

    expect(source).toContain("import JsonLd from '@/components/seo/JsonLd'")
    expect(source).toContain('<JsonLd schema={faqSchema(hub)} />')
  })
})
