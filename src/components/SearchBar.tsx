export default function SearchBar() {
  return (
    <div
      className="sticky z-30 top-[3.25rem] border-b border-b-[color:var(--border-c)] bg-[color-mix(in_oklab,var(--bg-c)_85%,transparent_15%)] backdrop-blur-[6px]"
    >
      <div className="container py-3">
        <input className="input focus-glow" type="search" placeholder="Search herbs, compounds, effects…" />
      </div>
    </div>
  );
}
