export default function SearchBar(){
  return (
    <div className="sticky z-30" style={{ top: "3.25rem", borderBottom: "1px solid var(--border-c)",
      background: "color-mix(in oklab, var(--bg-c) 85%, transparent 15%)", backdropFilter:"blur(6px)" }}>
      <div className="container py-3">
        <input className="input" type="search" placeholder="Search herbs, compounds, effects…" />
      </div>
    </div>
  );
}
