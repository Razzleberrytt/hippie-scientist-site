import EntityDatabasePage from "@/components/EntityDatabasePage";
import type { Herb } from "@/types";
import herbsData from "@/data/herbs/herbs.normalized.json";
import { decorateHerbs } from "@/lib/herbs";
import { ENABLE_ADVANCED_FILTERS } from "@/config/ui";
import { getCounters } from "@/lib/counters";

const counters = getCounters();
const decoratedHerbs = decorateHerbs(herbsData as Herb[]);

export default function HerbsPage() {
  return (
    <EntityDatabasePage
      title="Herb Database"
      description="Search and explore the library."
      metaPath="/herbs"
      items={decoratedHerbs}
      kind="herb"
      counters={counters}
      enableAdvancedFilters={ENABLE_ADVANCED_FILTERS}
    />
  );
}
