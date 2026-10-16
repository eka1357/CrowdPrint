# Feature Specifications: Crowdprint

## P0 Features (Must Ship by Day 8 — Core Engine)

### F1. 1-Click Judge Presets (Zero-Typing Entry)
- 3 pre-configured event briefs at the top of the app.
- Backed by real cached Qloo API responses stored in `src/data/presets_cache.json`, with a "Re-run Live Qloo Query" button if the judge wants to trigger a fresh network call.

### F2. Multi-Artist Entity Resolution & Taste Intersection
- Resolves each artist in the lineup to their canonical Qloo `entity_id` (`urn:entity:artist`).
- Displays resolved artist pills with confirmation checkmarks so judges see exact entity grounding.

### F3. Cross-Domain Sponsor Ranking (`urn:entity:brand`)
- Queries Qloo `/v2/insights` using the resolved artist seed IDs and city filter to retrieve correlated commercial brands.
- Ranks brands by Qloo affinity/correlation score and surfaces shared taste tags explaining *why* the audience overlaps.

### F4. Deterministic Commercial Rules Layer
- Pure TypeScript filtering engine (`src/lib/rules.ts`) that evaluates every Qloo brand candidate against event constraints:
  - **Category Exclusivity Lock:** e.g., If "Nike" is locked as Footwear Sponsor, or "Alcohol" is restricted for an all-ages venue, any conflicting Qloo brand (e.g., Adidas, Pabst, Hendrick's) is automatically intercepted.
  - **Visible Rejection Audit Log:** Rejected high-affinity brands aren't silently deleted—they are shown in a dedicated "Filtered by Commercial Rules" section (`[Blocked: Category Conflict with Existing Sponsor]`). This proves to judges that the agent combines cultural taste with real-world business logic.

### F5. "Qloo vs. Plain LLM" Side-by-Side Toggle
- Runs the exact same event brief through a plain LLM prompt *without* Qloo tools.
- Renders a visual comparison showing:
  - **Plain LLM Output:** Predictable, generic fortune-500 sponsors (Red Bull, Spotify, Heineken, Vans) with zero empirical audience metrics.
  - **Crowdprint + Qloo Output:** Culturally specific, high-affinity brands with verifiable Qloo entity IDs and cross-domain taste signals.

### F6. Inspectable Evidence Trail Drawer
- Clicking **"Inspect Evidence"** on any sponsor card slides open a drawer displaying:
  - The exact seed `entity_id`s passed to Qloo.
  - The raw Qloo API query parameters (sanitized of API keys).
  - The exact affinity score and taste tags returned by Qloo.
  - The Commercial Rules checklist result (`Pass/Fail`).

---

## P1 Features (Days 9–10 — Only After P0 is Deployed)

### F7. Evidence-Grounded Activation & Pitch Generator
- Generates 2 on-site activation concepts and 1 sponsorship outreach email for the top 3 ranked sponsors.
- **Strict Attribution Rule:** Each activation must pull a secondary Qloo cross-domain signal (e.g., correlated dining/food item or fashion aesthetic tag for that same lineup) and display a green `[Qloo Signal: <Tag/Entity>]` badge. Any extrapolated execution detail is badged in amber as `[Creative Suggestion]`.

---

## P2 Conditional Feature (Only if Day-2 Gate Test Passes Check #3)

### F8. Neighborhood Pop-Up / Activation Zone Map
- **Gate Condition:** Only build if `scripts/gate_test.mjs` proves Qloo `/v2/insights` returns distinct `urn:entity:place` results at the neighborhood level (e.g., Williamsburg vs. Lower East Side) rather than identical city-wide lists.