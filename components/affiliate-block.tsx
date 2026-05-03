import { AFFILIATE_TAGS } from '@/config/affiliate'

type Props = {
  name: string
}

export default function AffiliateBlock({ name }: Props) {
  const query = encodeURIComponent(name + ' supplement')
  const amazonLink = `https://www.amazon.com/s?k=${query}&tag=${AFFILIATE_TAGS.amazon}`

  return (
    <div className="mt-8 rounded-2xl border p-5">
      <h3 className="text-xl font-bold">Best forms of {name}</h3>

      <p className="mt-2 text-sm text-gray-600">
        Look for standardized extracts, third-party testing, and clear dosing.
      </p>

      <div className="mt-4 flex gap-3">
        <a
          href={amazonLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-emerald-500 px-4 py-2 text-white font-semibold"
        >
          View options
        </a>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Affiliate link. We may earn a commission at no extra cost.
      </p>
    </div>
  )
}
