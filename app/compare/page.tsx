import Link from 'next/link'

export default function CompareHub() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-4xl font-black">Compare Supplements</h1>
      <p className="text-slate-600">Compare compounds side-by-side to find the best option for your goal.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/compounds" className="rounded-2xl border p-4">
          Browse compounds →
        </Link>
        <Link href="/" className="rounded-2xl border p-4">
          Start from goals →
        </Link>
      </div>
    </main>
  )
}
