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
      className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-md transition hover:bg-white/8 active:scale-[.99]"
      aria-label={`${value} ${label}`}
    >
      <span className="grid size-8 place-content-center rounded-full bg-white/10 text-sm font-semibold text-white/90">
        {value}
      </span>
      <span className="text-white/90">{label}</span>
    </Link>
  );
}
