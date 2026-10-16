# Testing, Gate Protocol & Evaluation Plan: Crowdprint

## 1. Phase 1: The 48-Hour API Feasibility Gate (`scripts/gate_test.mjs`)
Before building secondary features, run `node --env-file=.env.local scripts/gate_test.mjs` with your real `QLOO_API_KEY` across the 3 preset lineups (NYC, LA, London).

### Pass/Fail Criteria:
1. **Check 1 (Artist Resolution):** Do at least 3 out of 4 artists per lineup resolve to valid `urn:entity:artist` IDs?
2. **Check 2 (Brand Specificity):** Does `/v2/insights` (`filter.type=urn:entity:brand`) return at least 8 recognizable, non-generic commercial brands per lineup?
3. **Check 3 (Plain LLM Differentiation):** Is the top-10 Qloo brand list less than 40% overlapping with a plain LLM's top-10 guesses (e.g., Red Bull, Heineken, Spotify)?
4. **Check 4 (Geographic Granularity):** Does querying "Williamsburg, Brooklyn" vs. "Lower East Side, Manhattan" return different place/brand rankings?
   - *If Check 4 is YES:* Enable P2 Neighborhood Map badge.
   - *If Check 4 is NO:* Keep location strictly at the City/DMA level and omit the map.

## 2. Phase 2: Unit & Determinism Tests
- **Commercial Rules Test:** Pass a mock list of 10 Qloo brands containing 2 alcohol brands (`Hendrick's Gin`, `Guinness`) and 1 locked competitor (`Adidas`) with constraints `blockCategories: ['Alcohol']` and `lockedCompetitors: ['Adidas']`. Assert that all 3 are moved to `rejected[]` with exact `reasonCode` explanations and 0 appear in `approved[]`.
- **Evidence Integrity Test:** Assert that every `ApprovedSponsor` rendered in the UI has a non-empty `entityId` matching `^urn:entity:` and a `rawQueryUrl`.

## 3. Phase 3: The 8-Scenario Automated Benchmark (`scripts/run_eval.mjs`)
Run on Day 11 across 8 diverse real-world event lineups (Electronic, Indie Rock, Hip-Hop, Latin, Jazz, Country, K-Pop, Comedy).
Compute and publish the following real metrics in `README.md` (never fabricate numbers):
1. **Entity Resolution Rate (%):** Percentage of lineup artists resolved to Qloo IDs.
2. **Jaccard Divergence vs. Plain LLM (%):** Measures how different Qloo's brand recommendations are from vanilla LLM guesses ($1 - \frac{\vert{}Qloo \cap LLM\vert{}}{\vert{}Qloo \cup LLM\vert{}}$).
3. **Rule Compliance Rate (100%):** Percentage of restricted category brands successfully intercepted by the Commercial Rules Engine.
4. **Median Pipeline Latency (ms):** Cold vs. cached execution time.