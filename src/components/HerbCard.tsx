export function HerbCard({ herb }: HerbCardProps) {
  return (
    <div className="herb-card">
      <h2 className="herb-card__name">{herb.name}</h2>
      <p className="herb-card__description">
        {herb.description || "No description available."}
      </p>
      <p className="herb-card__effect">
        {herb.effects?.join(", ") || "No listed effects"}
      </p>
      <p className="herb-card__mechanism">
        {herb.mechanismOfAction || "Mechanism unknown"}
      </p>
      <p className="herb-card__toxicity">
        LD50: {herb.toxicityLD50 || "N/A"}
      </p>
    </div>
  );
}
