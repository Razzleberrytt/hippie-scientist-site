export interface IndexItem {
  slug: string;
  name: string;
  summary: string;
  primary_effects?: string[];
  effects?: string[];
  evidence_grade?: string;
  evidence_tier?: string;
}

export interface DetailItem extends IndexItem {
  description: string;
  mechanisms?: string[];
  contraindications?: string[];
  interactions?: string[];
  side_effects?: string[];
  dosage?: string;
  typical_dosage?: string;
  forms?: string[];
  conditions?: string[];
  tags?: string[];
}

export interface StackItem {
  slug: string;
  title: string;
  goal: string;
  short_description: string;
  stack: { compound: string; dosage: string; timing?: string; role: string }[];
}
