import type { Entity } from "@/lib/data";

export default function EntityCard({ e }: { e: Entity }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
      <h3 className="text-xl font-semibold text-white md:text-2xl">
        {e.commonName ?? e.latinName}
      </h3>
      {e.commonName && (
        <p className="mt-1 italic text-white/60">{e.latinName}</p>
      )}
      {e.summary && <p className="mt-3 text-white/80">{e.summary}</p>}
      {e.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {e.tags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
