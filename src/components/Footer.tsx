export default function Footer() {
  return (
    <footer className="relative py-6 text-center text-sm" style={{ color: "var(--muted-c)" }}>
      <div
        className="absolute inset-0 mx-auto my-0 h-full w-11/12 rounded-full blur-sm"
        style={{ border: "1px solid color-mix(in oklab, var(--border-c) 70%, transparent 30%)" }}
        aria-hidden="true"
      />
      <span className="relative" style={{ color: "var(--accent)" }}>
        © {new Date().getFullYear()} The Hippie Scientist
      </span>
    </footer>
  )
}
