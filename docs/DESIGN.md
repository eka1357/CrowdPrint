# Design System & UI Specification: Crowdprint

## 1. Visual Aesthetic Philosophy
Inspired by **Bklit.com** (dark industrial precision), **Manus.im** (split-pane transparent agent execution), and **21st.dev / ReactBits** (tactile micro-interactions).
- **No generic AI purple gradients.** Use deep carbon/obsidian surfaces, crisp `1px` borders, and semantic status colors that communicate data provenance at a glance.

## 2. Color Tokens (RealtimeColors Calibrated)
```css
:root {
  --bg-canvas: #090A0F;          /* Primary deep obsidian background */
  --bg-surface: #11131C;         /* Card & panel surface */
  --bg-elevated: #181B26;        /* Hover & drawer surface */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-highlight: rgba(255, 255, 255, 0.18);

  --text-primary: #F3F4F6;       /* Crisp off-white */
  --text-secondary: #9CA3AF;     /* Muted slate */
  --text-mono: #CBD5E1;          /* Monospace data readouts */

  /* Semantic Provenance Colors (CRITICAL FOR JUDGING) */
  --signal-qloo: #10B981;        /* Electric Emerald: Verified Qloo API Signal */
  --signal-qloo-bg: rgba(16, 185, 129, 0.12);
  --signal-llm: #F59E0B;         /* Warm Amber: Plain LLM / Creative Inference */
  --signal-llm-bg: rgba(245, 158, 11, 0.12);
  --rule-reject: #EF4444;        /* Crimson: Commercial Rule Rejection */
  --rule-reject-bg: rgba(239, 68, 68, 0.12);
}
3. Typography
Headings: Plus Jakarta Sans or Inter Tight (SemiBold/Bold, tracking -0.02em).

Body: Inter (Regular/Medium, clean legibility).

Technical Readouts, Entity URNs, & Affinity Scores: JetBrains Mono (monospace is mandatory for all Qloo Entity IDs like urn:entity:brand:xxxx and affinity scores).

4. Layout Architecture (Manus.im Split Workspace)
Top Header Bar (64px): Crowdprint wordmark, API Connection Status Pill (Qloo Taste Graph: Connected or Cached Preset Mode), and GitHub Repo Link.

Preset Bar (Supahero Style): 3 prominent 1-click preset cards across the top of the workspace so judges get results in 1 click with zero typing.

Main Split Grid (12 Columns on Desktop):

Left Column (4 cols) — Brief & Live Agent Trace (Manus Pattern):

Collapsible Brief Editor (Artists, City, Category Exclusions, Budget Tier).

Live Agent Step Log showing each Qloo API call (GET /search, GET /v2/insights), response latency (ms), and number of entities retrieved.

Right Column (8 cols) — Results & Comparative Intelligence:

Primary Mode Toggle (21st.dev Segmented Control):

Ranked Sponsors (Qloo Grounded)

Side-by-Side: Qloo vs. Plain LLM

Commercial Rule Rejections (Audit Log)

Sponsor Bento Cards (ReactBits <SpotlightCard />):

Rank badge, Brand Name, Category, Qloo Affinity Score (<CountUp />), Shared Taste Tags, "Inspect Qloo Evidence" drawer trigger, and "View 2 Activations + Pitch Email" tab.

5. Animation & Interaction Rules (Motion.dev + ReactBits)
Use framer-motion / motion layout transitions (layoutId) when toggling between Qloo-Grounded and Plain-LLM views so cards visibly reorder and contrast.

Never use smooth-scroll hijacking (no Lenis/Barba) so native scrolling inside the Evidence JSON drawer and sponsor list remains instant and responsive.