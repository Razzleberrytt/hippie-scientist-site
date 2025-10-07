export default function Chip({ children }: { children: any }) {
  return (
    <span className="inline-block text-xs px-2 py-1 rounded-full bg-white/10 mr-2 mb-2">
      {children}
    </span>
  );
}
