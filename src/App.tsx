
import { herbsData } from './herbsData';
import { HerbCard } from './HerbCard';

function App() {
  return (
    <div className="min-h-screen bg-[#0f0e17] text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8">🌿 Hippie Scientist Herbs 🌿</h1>
      <div className="max-w-3xl mx-auto">
        {herbsData.map((herb, i) => (
          <HerbCard key={i} herb={herb} />
        ))}
      </div>
    </div>
  );
}

export default App;
