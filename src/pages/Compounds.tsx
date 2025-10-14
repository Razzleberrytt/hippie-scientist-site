import EntityDatabasePage from "@/components/EntityDatabasePage";
import { getCounters } from "@/lib/counters";
import { decorateCompounds } from "@/lib/compounds";

const counters = getCounters();
const decoratedCompounds = decorateCompounds();

export default function CompoundsPage() {
  return (
    <EntityDatabasePage
      title="Active Compounds"
      description="Search and explore the molecule library."
      metaPath="/compounds"
      items={decoratedCompounds}
      kind="compound"
      counters={counters}
    />
  );
}
