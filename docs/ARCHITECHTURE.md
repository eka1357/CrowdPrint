# System Architecture & Repository Structure: Crowdprint

## 1. Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript) running as a persistent Node.js server (NOT static export).
- **Styling & UI:** Tailwind CSS + `motion` (Framer Motion) + `lucide-react` + custom 21st.dev / ReactBits components.
- **Caching Layer:** Two-tier cache (`src/lib/cache.ts`):
  1. Committed JSON preset cache (`src/data/presets_cache.json`) for instant `<100ms` judge preset loading.
  2. Runtime file/memory LRU cache keyed by SHA-256 hash of `(sortedSeedIds + city + endpoint)` to prevent Qloo API rate-limiting during live judging.
- **Deployment Target:** **Railway** or **Render** (Web Service, Node 20+). Avoid Vercel serverless functions if integrating with the stateful `qloo-hackathon-kit` Node harness.

## 2. Directory Structure
```text
crowdprint/
├── LICENSE                         # MIT License (REQUIRED in root for GitHub About detection)
├── README.md                       # Architecture diagram, setup steps, 8-scenario eval benchmark
├── .env.example                    # Template of required environment variables
├── docs/                           # All 6 specification files
├── scripts/
│   ├── gate_test.mjs               # Day-2 API Feasibility Gate script
│   └── run_eval.mjs                # Day-11 automated 8-scenario benchmark script
├── src/
│   ├── data/
│   │   ├── presets.ts              # 3 real-world festival/event presets
│   │   ├── presets_cache.json      # Real cached Qloo responses for instant judge UX
│   │   └── mock_fixtures.json      # Used ONLY when QLOO_MOCK_FIXTURE_MODE=true before key arrives
│   ├── lib/
│   │   ├── qloo.ts                 # Typed Qloo API client with latency telemetry & caching
│   │   ├── rules.ts                # Deterministic Commercial Rules Engine
│   │   ├── llm.ts                  # Plain LLM baseline vs. Grounded Activation generator
│   │   ├── agent.ts                # Main orchestrator streaming step events to the UI
│   │   └── types.ts                # Shared TypeScript interfaces
│   ├── components/
│   │   ├── PresetHero.tsx          # Zero-typing 3-preset selector bar
│   │   ├── AgentTracePane.tsx      # Manus-style live Qloo API execution log
│   │   ├── SponsorCard.tsx         # Bklit/ReactBits dark card with provenance badges
│   │   ├── EvidenceDrawer.tsx      # Slide-over inspector showing raw Qloo entity IDs & query
│   │   ├── LlmDiffView.tsx         # Side-by-side Qloo vs. Plain LLM comparison
│   │   └── RejectedRulesLog.tsx    # Visible audit log of brands blocked by commercial rules
│   └── app/
│       ├── layout.tsx              # Dark obsidian theme + fonts
│       ├── page.tsx                # Main split-screen workspace
│       └── api/
│           └── analyze/
│               └── route.ts        # POST endpoint executing the Crowdprint pipeline
3. Data Flow & Telemetry
Every call through src/lib/qloo.ts records a QlooCallTrace object:

TypeScript
export interface QlooCallTrace {
  stepId: string;
  endpoint: string;
  params: Record<string, string>;
  status: number;
  latencyMs: number;
  entitiesReturned: number;
  mode: 'LIVE_QLOO' | 'CACHED_QLOO' | 'MOCK_FIXTURE';
}
This array is returned with every analysis response and rendered directly in the left-hand Live Qloo Execution Trace pane.