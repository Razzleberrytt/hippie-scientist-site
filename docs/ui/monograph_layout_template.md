# Monograph Page Layout Template — The Hippie Scientist

Use this specification to build or refactor the dynamic route components for `/herbs/[slug]` and `/compounds/[slug]`. All data points must be pulled strictly from the generated runtime JSON originating from the master workbook.

## 1. Grid & Visual Theme
- **Background:** Calm, neutral, premium dark or light mode (adhering to global Tailwind configurations).
- **Max Width:** `max-w-4xl` or `max-w-5xl` centered, giving a spacious, readable clinical workbook feel.
- **Spacing:** Generous padding (`py-8 px-4 sm:px-6lg:px-8`) to prevent dense text blocks.

## 2. Component Structure

### Section A: The Hero Header
- **Element:** `<h1>` text-4xl font-bold tracking-tight
- **Data Field:** `Common_Name` (e.g., "Ashwagandha")
- **Sub-element:** `<h2>` text-xl italic text-muted-foreground mt-2
- **Data Field:** `Botanical_Name` (e.g., "*Withania somnifera*")
- **Description:** `<p>` text-base mt-4 leading-relaxed max-w-2xl
- **Data Field:** `Quick_Summary` (Strictly conservative, 2 sentences max, no medical claims).

### Section B: Quick-Scan Stats Bar
A flex row or a small responsive grid (`grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6`) rendering high-visibility UI badges:
1. **Evidence Badge:** - **UI:** Colored banner (e.g., Green for Strong, Amber for Emerging).
   - **Data Field:** `Evidence_Level`
2. **Primary Focus Badge:** - **UI:** Clean icon + text.
   - **Data Field:** `Primary_Category` (e.g., "Cognitive Support")
3. **Safety Profile Badge:** - **UI:** Outline or solid badge shifting color based on caution levels.
   - **Data Field:** `Safety_Rating` (e.g., "High Safety", "Interaction Caution")

### Section C: The Vetted Sourcing Hub (Monetization Card)
- **UI:** A distinct callout box with a subtle background accent border (`border l-4 border-accent bg-accent/10 p-4 rounded-r-lg my-8`).
- **Header:** "Evidence-Backed Sourcing" (font-semibold text-lg)
- **Context Text:** "To align with clinical research parameters, look for extracts standardized to active constituent thresholds."
- **Call-to-Action Button:** Centered or full-width on mobile (`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors`)
- **Data Field:** `Affiliate_URL`
- **Button Text:** "View Vetted Source 🛒"

### Section D: Tabbed / Accordion Research Details
Use an accessible radix-ui or custom React tab state to toggle deeper details:

- **Tab 1: 🔬 Biochemical Mechanisms**
  - **Format:** Clean bulleted list.
  - **Data Field:** `Mechanisms` (e.g., "Modulating cortisol pathways", "GABA receptor affinity")
- **Tab 2: 📊 Human Clinical Data**
  - **Format:** Simple, scannable table mapping clinical trial touchpoints.
  - **Columns:** Target Outcome | Dosage Parameters | Human Consensus
- **Tab 3: ⚠️ Safety & Interactions**
  - **Format:** Warning callout block containing known pharmaceutical interactions and contraindications.
  - **Data Field:** `Safety_Contraindications`

## 3. Implementation Guardrails
- **Deterministic Check:** If `Affiliate_URL` is empty, conditionally hide the Vetted Sourcing Hub card or fallback to a standard educational notification; do not hardcode vendor placeholders.
- **Mobile Fidelity:** Ensure the Quick-Scan Stats Bar stacks cleanly on smaller viewports without overflowing text.
