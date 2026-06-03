import Link from 'next/link'
import { AFFILIATE_TAGS } from '@/config/affiliate'
import { isRestrictedIngredient, isRestrictedRecord } from '@/lib/restricted-ingredients'

function buildStackAmazonUrl(name: string) {
  if (isRestrictedIngredient(name)) return ''
  const encoded = encodeURIComponent(`${name} supplement third party tested`)
  return `https://www.amazon.com/s?k=${encoded}&tag=${AFFILIATE_TAGS.amazon}`
}

export default function StackTemplate({
  title,
  summary,
  records = [],
}: any) {
  return (
    <main className="container-page py-12 space-y-10">
      <section className="hero-shell rounded-[2rem] p-8 shadow-card">
        <div className="max-w-4xl space-y-5">
          <p className="eyebrow-label">Stack System</p>

          <h1>{title}</h1>

          <p className="detail-reading text-lg">
            {summary}
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Suggested Profiles</p>
          <h2>Mechanism-aware stack components</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {records.map((record: any) => {
            const affiliateUrl = isRestrictedRecord(record) ? '' : buildStackAmazonUrl(record.name)

            return (
              <article
                key={record.slug}
                className="card-premium p-5"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {record.name}
                  </h3>

                  <p className="line-clamp-4 text-sm leading-7 text-[#46574d]">
                    {record.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/${record.entityType}s/${record.slug}`}
                      className="button-secondary inline-flex rounded-full px-4 py-2 text-sm"
                    >
                      View Profile
                    </Link>
                    {affiliateUrl ? (
                      <a
                        href={affiliateUrl}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
                      >
                        Shop on Amazon
                      </a>
                    ) : null}
                  </div>
                  {affiliateUrl ? (
                    <p className="text-[0.65rem] text-muted">
                      Affiliate link. We may earn a commission at no cost to you.
                    </p>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
