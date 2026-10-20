# Crowdprint — Cultural Intelligence for Live Event Sponsorship & Activations

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](./LICENSE)
[![Powered by Qloo](https://img.shields.io/badge/Taste_Graph-Qloo_API-10B981)](https://qloo.com)
[![Next.js 15](https://img.shields.io/badge/Framework-Next.js_15_(Turbopack)-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-blue)](https://www.typescriptlang.org)
[![Benchmark](https://img.shields.io/badge/Qloo_Divergence-97.6%25-emerald)](./docs/BENCHMARK_RESULTS.json)

> **Built for the Qloo Agentic Hackathon.** Crowdprint is an autonomous sponsorship strategist agent that converts an event's artist lineup, host city, and commercial restrictions into an inspectable, mathematically backed brand sponsor shortlist and on-site activation blueprint—powered by Qloo's 250M+ entity Taste AI Graph.

---

## The Core Problem: Why Live Events Need Qloo

Ask any general-purpose LLM (GPT-4o, Claude 3.5, Gemini 1.5) to suggest sponsors for an underground electronic rave in Brooklyn, an indie showcase in Silver Lake, or a Latin trap stadium tour in Miami, and it outputs the **exact same generic Fortune 500 roster every single time**:

$$\text{Generic LLM Guess} \longrightarrow \text{Red Bull, Heineken, Spotify, Nike, Uber, Monster Energy}$$

In real-world live entertainment, promoters cannot pitch generic megabrands. Top-tier festivals sign exclusive category deals, venues enforce strict all-ages liquor bans, and audiences reject brands that feel culturally disconnected. 

**Crowdprint solves this by grounding sponsorship decisions in empirical cross-domain audience overlap:**
1. **Multi-Artist Entity Resolution:** Disambiguates raw artist strings into canonical `urn:entity:artist` UUID nodes in Qloo's 250M+ entity knowledge graph.
2. **Cross-Domain Taste Affinity:** Queries Qloo `/v2/insights` across `urn:entity:brand`, `urn:tag`, and `urn:entity:place` to uncover statistically validated cultural affinities.
3. **Deterministic Commercial Rule Interception:** Pure TypeScript rule enforcement that intercepts competitor conflicts, alcohol age restrictions, and fast-fashion bans without LLM hallucination.
4. **Attributed Activation Synthesis:** Generates high-converting experiential activations with strict attribution separating verified Qloo taste signals from creative execution.

---

## 8-Scenario Live Qloo Benchmark Results

To evaluate performance across diverse musical and geographical subcultures, we executed an automated benchmark against the live Qloo API (`https://hackathon.api.qloo.com`) across 8 real-world event lineups.

### Aggregate Benchmark Scorecard

| Metric | Score / Measurement | Verification Method |
| :--- | :--- | :--- |
| **Artist Resolution Rate** | **100.0% (28 / 28)** | Exact normalized string match against canonical Qloo `urn:entity:artist` |
| **Qloo Brand Retrieval** | **20 / 20 per scenario (160 total)** | Live `/v2/insights?filter.type=urn:entity:brand` |
| **Cultural Divergence vs. LLM** | **97.6% Average Jaccard Divergence** | $1 - \frac{\|Qloo \cap LLM\|}{\|Qloo \cup LLM\|}$ vs. generic baseline |
| **Commercial Rule Determinism** | **100.0% (3x verified)** | Pure TypeScript execution in [`src/lib/rules.ts`](./src/lib/rules.ts) |
| **Commercial Rule Interceptions** | **12 Brands Blocked** | Intercepts competitor locks, media exclusions & fast fashion |
| **Cold Live Qloo API Latency** | **4,851 ms average** | Full end-to-end multi-entity live network query |
| **Cached Re-evaluation Latency** | **1.3 ms average** | Sub-millisecond in-process cache hydration & re-audit |

*(Full raw JSON results with per-call request telemetry are preserved in [`docs/BENCHMARK_RESULTS.json`](./docs/BENCHMARK_RESULTS.json))*

---

### Full 8-Scenario Subculture Breakdown Table

The table below contrasts the high-affinity cultural innovators identified by Qloo against the predictable, generic Fortune 500 guesses made by plain LLMs:

| # | Event Scenario & City | Lineup Talent | Top 3 Qloo Brand Matches (Affinity %) | Generic Plain LLM Guesses | Jaccard Divergence | Commercial Interceptions |
| :-: | :--- | :--- | :--- | :--- | :-: | :--- |
| **1** | **Brooklyn Warehouse Electronic**<br>*New York City, NY* | Fred again..<br>Four Tet<br>Peggy Gou<br>Overmono | **Rains** (95.4%)<br>**Urbanears** (95.4%)<br>**Vice** (95.2%) | Red Bull, Heineken, Spotify, Pioneer DJ, Vans, Uber, Monster Energy | **100.0%**<br>*(0% overlap)* | **4 blocked**<br>• Urbanears *(AIAIAI audio lock)*<br>• Vice, i-D *(Media ban)* |
| **2** | **Silver Lake Indie & Alt-R&B**<br>*Los Angeles, CA* | Khruangbin<br>Steve Lacy<br>Clairo<br>Men I Trust | **Urban Outfitters** (98.0%)<br>**Dr. Martens** (97.1%)<br>**Free People** (96.8%) | Urban Outfitters, Dr. Martens, Subaru, Pabst Blue Ribbon, Fender, Ray-Ban | **92.3%**<br>*(UO & Docs match)* | **3 blocked**<br>• Brandy Melville *(Eco ban)*<br>• Nasty Gal *(Eco ban)*<br>• American Apparel *(Eco ban)* |
| **3** | **Hackney Underground Jazz & Grime**<br>*London, UK* | Ezra Collective<br>Little Simz<br>Yussef Dayes | **Stones Throw Records** (97.4%)<br>**Vice** (96.5%)<br>**Discogs** (96.0%) | Jameson, Yamaha Music, Rolex, Starbucks, Guinness, Apple Music | **100.0%**<br>*(0% overlap)* | **3 blocked**<br>• Y-3 *(Nike footwear lock)*<br>• Clarks *(Nike footwear lock)*<br>• Grenson *(Nike footwear lock)* |
| **4** | **Austin Psych & Garage Rock**<br>*Austin, TX* | King Gizzard & The Lizard Wizard<br>Tame Impala<br>Black Pumas | **Patagonia** (97.0%)<br>**The North Face** (96.7%)<br>**Vice** (96.3%) | Vans, Pabst Blue Ribbon, Fender, Gibson, Marshall, Converse, Levi's | **92.3%**<br>*(Fender, Gibson match)* | **0 blocked**<br>*(Clean audit pass)* |
| **5** | **Miami Latin Urbano Stadium**<br>*Miami, FL* | Bad Bunny<br>Feid<br>Karol G<br>Rauw Alejandro | **Studio F** (95.9%)<br>**Colombia Football** (95.3%)<br>**Leonisa** (94.7%) | Corona, Pepsi, Buchanan's, Goya Foods, AT&T, Toyota, Spotify | **100.0%**<br>*(0% overlap)* | **0 blocked**<br>*(Clean audit pass)* |
| **6** | **Atlanta Trap & Southern Hip-Hop**<br>*Atlanta, GA* | Future<br>21 Savage<br>Metro Boomin<br>Gunna | **Off-White** (97.1%)<br>**Nice Kicks** (96.9%)<br>**Beats Electronics** (96.9%) | Hennessy, Sprite, Nike, Luc Belaire, Balenciaga, Beats, Rolling Loud | **96.3%**<br>*(Balenciaga overlap)* | **0 blocked**<br>*(Clean audit pass)* |
| **7** | **Nashville Americana & Alt-Country**<br>*Nashville, TN* | Zach Bryan<br>Kacey Musgraves<br>Tyler Childers | **Chubbies** (97.6%)<br>**Southern Tide** (97.0%)<br>**Shinesty** (96.7%) | Wrangler, Jack Daniel's, Ford, Carhartt, Coors Banquet, Yeti | **100.0%**<br>*(0% overlap)* | **2 blocked**<br>• Fast fashion apparel |
| **8** | **Seoul & LA K-Pop Arena Tour**<br>*Los Angeles, CA* | NewJeans<br>LE SSERAFIM<br>Stray Kids | **LA Kings** (94.9%)<br>**Yves Saint Laurent** (94.0%)<br>**iHeartRadio** (94.0%) | Samsung, Hyundai, McDonald's, Coca-Cola, Gentle Monster, Kia | **100.0%**<br>*(0% overlap)* | **0 blocked**<br>*(Clean audit pass)* |

---

## The 4-Step Qloo Taste Graph Pipeline

Crowdprint's agent architecture guarantees deterministic compliance, strict data provenance, and verifiable AI outputs:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EVENT BRIEF INPUT                                      │
│  Lineup: ["Fred again..", "Four Tet", "Peggy Gou"]  |  City: "New York City, NY"       │
│  Constraints: Blocked=["Mass Media", "Alcohol"], Locked=["AIAIAI"], Age="ALL_AGES"     │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: MULTI-ARTIST ENTITY RESOLUTION                                                 │
│ Endpoint: GET /search?query={artist}&types=urn:entity:artist&take=3                    │
│ • Canonicalizes fuzzy artist names into unambiguous Qloo UUIDs                        │
│ • Validates popularity scores & metadata tags                                          │
│ Output: ["D723CAE9-2A15-4F4B...", "1FCE26EB-24C4-4AD9...", "CCCDAEFE-96FC-414B..."]    │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: CROSS-DOMAIN TASTE GRAPH INGESTION                                             │
│ Endpoints (Executed in Parallel / Paced Batches):                                      │
│ • Brand Insights: GET /v2/insights?filter.type=urn:entity:brand&take=20               │
│ • Cultural Signals: GET /v2/insights?filter.type=urn:tag&filter.tag.types=...         │
│ • Hyper-Local Venues: GET /v2/insights?filter.type=urn:entity:place&filter.location=..  │
│ Output: 20 Brand Candidates (UUIDs + Affinity %) + Lifestyle Signals + Anchor Venues    │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: DETERMINISTIC COMMERCIAL RULES ENGINE (`src/lib/rules.ts`)                     │
│ Pure TypeScript Execution (ZERO LLM Delegation):                                      │
│ 1. Competitor Exclusivity Lock: Prevents category rival sign-ups (e.g. AIAIAI vs Urbanears)│
│ 2. Category Exclusion Filter: Blocks banned sectors (e.g. Mass Media -> Vice, i-D)     │
│ 3. Age Restrictions: Enforces ALL_AGES alcohol & cannabis prohibitions                 │
│ 4. Sustainability Mandate: Blocks fast-fashion retail (e.g. Brandy Melville, Nasty Gal)│
│ Output: Approved Sponsor Shortlist (16)  +  Commercial Rejections Audit Trail (4)     │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: ATTRIBUTED ACTIVATION SYNTHESIS (`src/lib/llm.ts`)                             │
│ Strictly Separates Verified Fact from Creative Suggestion:                             │
│ • [Qloo Signal Grounded]: Verbatim tag citation ("Matte Finishes", "Clean Lines")      │
│ • [Creative Extension]: Experiential on-site activation concept & VIP hospitality zone  │
│ • Hyper-Local Geo Anchors: Integrates neighborhood venues (e.g. Domino Park, Wythe)    │
│ • Tailored Pitch Email: Drafts executive outreach citing empirical Qloo affinity %     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Technical Features

### 1. Dual Execution Modes: Cached Qloo vs. Live Qloo
- **`CACHED_QLOO`**: Ships with zero-latency pre-compiled snapshots ([`src/data/presets_cache.json`](./src/data/presets_cache.json)) generated directly from the live API. Instant load times (<2ms) for showcase presets with emerald `• Cached` header badge.
- **`LIVE_QLOO`**: Clicking **"Re-run"** or submitting a custom festival lineup executes real-time HTTP queries against `https://hackathon.api.qloo.com` with real-time latency telemetry and emerald `• Live Qloo` badge.

### 2. Inspectable Evidence Trail (Zero Hallucination Guarantee)
Every sponsor recommendation includes an **Inspect Evidence** drawer displaying:
- Exact canonical artist seed UUIDs passed into the Qloo graph.
- Sanitized API request URL for independent curl reproduction.
- Multi-dimensional radar and bar visualizations of brand affinity.
- Audit checklist confirming deterministic clearance through commercial rules.

### 3. Hyper-Local Activation Venues (`urn:entity:place`)
Going beyond national brand deals, Crowdprint queries Qloo's physical venue graph to retrieve verified neighborhood cultural anchors (e.g., *Domino Park*, *Music Hall of Williamsburg*, *Baby's All Right* in Williamsburg; *Echo Park Lake*, *The Echo* in Silver Lake) for satellite brand pop-ups and afterparties.

---

## Quickstart & Local Setup

### Prerequisites
- Node.js 18.17+ or 20+
- A Qloo Hackathon API Key (`QLOO_API_KEY`)

### 1. Installation
```bash
git clone https://github.com/eka1357/CrowdPrint.git
cd CrowdPrint
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```bash
# Live Qloo Hackathon API Endpoint
QLOO_API_KEY=your_live_qloo_api_key_here
QLOO_API_URL=https://hackathon.api.qloo.com
QLOO_MOCK_FIXTURE_MODE=false

# Optional Gemini API Key for dynamic activation generation
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run the 8-Scenario Benchmark Suite
```bash
node --env-file=.env.local scripts/run_eval.mjs
```

### 5. Verify API Feasibility Gate Test
```bash
node --env-file=.env.local scripts/gate_test.mjs
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details. Built with pride for the **Qloo Agentic AI Hackathon 2026**.