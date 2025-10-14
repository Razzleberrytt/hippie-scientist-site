import { Link } from "react-router-dom";

type StatPillProps = {
  to: string;
  value: number;
  label: string;
  testId?: string;
};

export default function StatPill({ to, value, label, testId }: StatPillProps) {
  return (
    <Link
      data-testid={testId}
      to={to}
      className="group relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-md transition hover:bg-white/8 active:scale-[.99]"
      aria-label={`${value} ${label}`}
    >
      <span className="grid h-9 w-9 place-content-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white/90">
        {value}
      </span>
      <span className="text-white/90">{label}</span>
      <span aria-hidden className="ml-auto text-white/70 opacity-0 transition group-hover:opacity-100">
        ↗
      </span>
    </Link>
  );
}
