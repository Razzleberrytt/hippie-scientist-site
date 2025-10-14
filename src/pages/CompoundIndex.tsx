import { useEffect, useState } from "react";
import { loadCompounds, type Entity } from "@/lib/data";
import EntityCard from "@/components/EntityCard";

export default function CompoundIndex() {
  const [items, setItems] = useState<Entity[] | null>(null);

  useEffect(() => {
    let active = true;
    loadCompounds().then((data) => {
      if (active) setItems(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!items) {
    return <div className="p-6 text-white/70">Loading compounds…</div>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24">
      <header className="pt-8 pb-6">
        <h1 className="text-3xl font-bold text-white md:text-4xl">Compound Database</h1>
        <p className="mt-2 text-white/70">Active constituents, same card layout.</p>
      </header>
      <section className="grid gap-4 md:gap-5">
        {items.map((entity) => (
          <EntityCard key={entity.id} e={{ ...entity, kind: "compound" }} />
        ))}
      </section>
      {items.length === 0 && (
        <p className="mt-10 text-white/60">No compounds available.</p>
      )}
    </main>
  );
}
