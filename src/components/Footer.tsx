export default function Footer() {
  return (
    <footer className="relative py-6 text-center text-sm text-gray-400">
      <div className="absolute inset-0 mx-auto my-0 h-full w-11/12 rounded-full border border-psychedelic-purple/40 blur-sm" aria-hidden="true" />
      <span className="relative bg-gradient-to-r from-psychedelic-purple to-psychedelic-pink bg-clip-text text-transparent">
        © {new Date().getFullYear()} The Hippie Scientist
      </span>
    </footer>
  );
}
