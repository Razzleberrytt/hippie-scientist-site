import { useState } from "react";

export default function Collapse({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: any;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3 bg-white/5 flex items-center justify-between"
      >
        <span className="font-semibold">{title}</span>
        <span className="text-sm opacity-80">{open ? "Hide" : "Show"}</span>
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </section>
  );
}
