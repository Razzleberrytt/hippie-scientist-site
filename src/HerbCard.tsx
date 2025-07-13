
export function HerbCard({ herb }) {
  return (
    <div className="p-4 border border-gray-600 rounded mb-4">
      <h2 className="text-2xl font-semibold">{herb.name}</h2>
      <p className="text-sm text-gray-300">{herb.description}</p>
      <p className="text-sm mt-2"><strong>Effects:</strong> {herb.effects?.join(", ")}</p>
      <p className="text-sm"><strong>Mechanism:</strong> {herb.mechanismOfAction}</p>
      <p className="text-sm"><strong>LD50:</strong> {herb.toxicityLD50}</p>
    </div>
  );
}
