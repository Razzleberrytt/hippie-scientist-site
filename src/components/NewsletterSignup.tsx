export default function NewsletterSignup({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const baseClasses = compact ? "flex gap-2" : "card p-4 grid gap-3";

  return (
    <form className={className ? `${className} ${baseClasses}` : baseClasses}>
      {!compact && <h3 className="text-lg font-semibold">Join our Newsletter</h3>}
      <div className="flex gap-2">
        <input className="input flex-1" placeholder="you@example.com" type="email" required />
        <button className="btn primary" type="submit">Subscribe</button>
      </div>
    </form>
  );
}
